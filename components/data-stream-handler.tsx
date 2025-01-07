'use client';

import { useChat } from 'ai/react';
import { useEffect, useRef } from 'react';
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

  useEffect(() => {
    if (!dataStream?.length) return;

    const newDeltas = dataStream.slice(lastProcessedIndex.current + 1);
    lastProcessedIndex.current = dataStream.length - 1;

    newDeltas.forEach((delta: DataStreamDelta) => {
      console.log('Received delta:', delta); // Debugging log

      if (delta.type === 'user-message-id') {
        setUserMessageIdFromServer(delta.content as string);
        return;
      }

      switch (delta.type) {
        case 'text-delta':
          setMessages((prevMessages) => {
            if (prevMessages.length === 0) {
              console.log('Appending new assistant message with text-delta'); // Debugging log
              return [
                {
                  id: generateUUID(),
                  role: 'assistant',
                  content: delta.content as string,
                  createdAt: new Date(),
                },
              ];
            }

            const lastMessage = prevMessages[prevMessages.length - 1];
            if (lastMessage.role === 'assistant') {
              console.log('Appending to existing assistant message'); // Debugging log
              return [
                ...prevMessages.slice(0, -1),
                {
                  ...lastMessage,
                  content: lastMessage.content + (delta.content as string),
                },
              ];
            } else {
              console.log('Appending new assistant message'); // Debugging log
              return [
                ...prevMessages,
                {
                  id: generateUUID(),
                  role: 'assistant',
                  content: delta.content as string,
                  createdAt: new Date(),
                },
              ];
            }
          });
          break;

        case 'text':
          setMessages((prevMessages) => {
            console.log('Appending complete assistant message with text'); // Debugging log
            return [
              ...prevMessages,
              {
                id: generateUUID(),
                role: 'assistant',
                content: delta.content as string,
                createdAt: new Date(),
              },
            ];
          });
          break;

        case 'suggestion':
          // Handle suggestions if necessary
          console.log('Suggestion received:', delta.content); // Debugging log
          break;

        case 'finish':
          // Optional: Handle any finalization if necessary
          console.log('Streaming finished'); // Debugging log
          break;

        // Handle other delta types if needed
        default:
          console.log('Unhandled delta type:', delta.type); // Debugging log
          break;
      }
    });
  }, [dataStream, setMessages, setUserMessageIdFromServer]);

  return null;
}