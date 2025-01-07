'use client';

import { useChat } from 'ai/react';
import { useEffect, useRef, useState } from 'react';
import { Suggestion } from '@/lib/db/schema';
import { useUserMessageId } from '@/hooks/use-user-message-id';
import { generateUUID } from '@/lib/utils';

type DataStreamDelta = {
  type:
    | 'text-delta'
    | 'code-delta'
    | 'title'
    | 'id'
    | 'suggestion'
    | 'clear'
    | 'finish'
    | 'user-message-id'
    | 'kind'
    | 'text';
  content: string | Suggestion;
};

export function DataStreamHandler({ id }: { id: string }) {
  const { data: dataStream, setMessages } = useChat({ id });
  const { setUserMessageIdFromServer } = useUserMessageId();
  const lastProcessedIndex = useRef(-1);
  const [accumulatedContent, setAccumulatedContent] = useState('');

  useEffect(() => {
    if (!dataStream?.length) return;

    const newDeltas = dataStream.slice(lastProcessedIndex.current + 1);
    lastProcessedIndex.current = dataStream.length - 1;

    newDeltas.forEach((delta: DataStreamDelta) => {
      if (delta.type === 'user-message-id') {
        setUserMessageIdFromServer(delta.content as string);
        return;
      }

      switch (delta.type) {
        case 'text-delta':
          setAccumulatedContent(prev => prev + (delta.content as string));
          setMessages((prevMessages) => {
            if (prevMessages.length === 0) {
              return [
                {
                  id: generateUUID(),
                  role: 'assistant',
                  content: accumulatedContent + (delta.content as string),
                  createdAt: new Date(),
                },
              ];
            }

            const lastMessage = prevMessages[prevMessages.length - 1];
            if (lastMessage.role === 'assistant') {
              return [
                ...prevMessages.slice(0, -1),
                {
                  ...lastMessage,
                  content: accumulatedContent + (delta.content as string),
                },
              ];
            } else {
              return [
                ...prevMessages,
                {
                  id: generateUUID(),
                  role: 'assistant',
                  content: accumulatedContent + (delta.content as string),
                  createdAt: new Date(),
                },
              ];
            }
          });
          break;

        case 'text':
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              id: generateUUID(),
              role: 'assistant',
              content: delta.content as string,
              createdAt: new Date(),
            },
          ]);
          setAccumulatedContent(''); // Reset accumulated content
          break;

        case 'finish':
          console.log('Streaming finished');
          break;

        default:
          console.log('Unhandled delta type:', delta.type);
          break;
      }
    });
  }, [dataStream, setMessages, setUserMessageIdFromServer, accumulatedContent]);

  return null;
}