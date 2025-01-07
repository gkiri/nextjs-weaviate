import { Message, createDataStreamResponse } from 'ai';
import { models } from '@/lib/ai/models';
import { convertToCoreMessages, getMostRecentUserMessage } from '@/lib/ai/messages';
import { generateUUID } from '@/lib/utils';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function POST(request: Request) {
  const { messages, modelId } = await request.json();
  console.log('Received request with modelId:', modelId);

  const model = models.find((model) => model.id === modelId);

  if (!model) {
    return new Response('Model not found', { status: 404 });
  }

  const coreMessages = convertToCoreMessages(messages);
  const userMessage = getMostRecentUserMessage(coreMessages);

  if (!userMessage) {
    return new Response('No user message found', { status: 400 });
  }

  const userMessageId = generateUUID();
  const assistantMessageId = generateUUID();

  return createDataStreamResponse({
    execute: async (dataStream) => {
      try {
        // Send initial message IDs
        dataStream.writeData({
          type: 'user-message-id',
          content: userMessageId,
        });

        const response = await fetch(`${BACKEND_URL}/api/get_syllabus_subtopic_stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream',
          },
          body: JSON.stringify({
            subtopic_id: 'H1_S1',
            user_id: generateUUID()
          })
        });

        if (!response.ok) {
          throw new Error('Backend error: ' + response.status);
        }

        const decoder = new TextDecoder();
        const reader = response.body?.getReader();
        
        if (!reader) {
          throw new Error('Failed to create reader');
        }

        let accumulatedContent = '';

        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;

          const text = decoder.decode(value);
          // Split by double newlines to separate SSE events
          const events = text.split('\n\n');

          for (const event of events) {
            if (!event.trim()) continue;
            
            if (!event.startsWith('data: ')) continue;

            try {
              // Parse the JSON data after 'data: '
              const data = JSON.parse(event.slice(6));
              
              if (data.type === 'text-delta') {
                dataStream.writeData({
                  type: 'text-delta',
                  content: data.content,
                });
                accumulatedContent += data.content;
              } else if (data.type === 'error') {
                throw new Error(data.content);
              } else if (data.type === 'finish') {
                // Handle completion
                break;
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
              continue;
            }
          }
        }

        // Send the final complete message
        dataStream.writeData({
          type: 'text',
          content: accumulatedContent,
          role: 'assistant',
          id: assistantMessageId,
        });

        // Signal completion
        dataStream.writeData({
          type: 'done',
          content: '',
        });

      } catch (error) {
        console.error('Error in stream processing:', error);
        dataStream.writeData({
          type: 'error',
          content: error instanceof Error ? error.message : 'Unknown error occurred',
        });
      }
    }
  });
}