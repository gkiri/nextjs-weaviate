'use client';

import { useChat } from 'ai/react';
import { Messages } from './messages';

export function VisualizationWindow() {
  const {
    messages,
    setMessages,
    isLoading,
  } = useChat({
    id: 'visualization',
    body: { mode: 'visualization' },
  });

  return (
    <div className="flex flex-col h-dvh bg-background border-l dark:border-zinc-700">
      <div className="px-4 py-2 border-b dark:border-zinc-700">
        <h2 className="text-lg font-medium">Visualization Board</h2>
      </div>
      
      <Messages
        chatId="visualization"
        isLoading={isLoading}
        messages={messages}
        setMessages={setMessages}
        reload={async () => null}
        isReadonly={true}
        isBlockVisible={false}
        isVisualizationMode={true}
        votes={undefined}
      />
    </div>
  );
}