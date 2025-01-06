'use client';

import { Message } from 'ai';
import Mermaid from './mermaid';
import { memo } from 'react';

function PureVisualizationMessage({ message }: { message: Message }) {
  // Parse message content to determine visualization type
  const visualizationType = detectVisualizationType(message.content);
  
  return (
    <div className="w-full p-4">
      {visualizationType === 'mermaid' && (
        <Mermaid content={extractMermaidContent(message.content)} />
      )}
      {visualizationType === 'bullet' && (
        <BulletPoints content={message.content} />
      )}
      {visualizationType === 'tree' && (
        <TreeView content={message.content} />
      )}
    </div>
  );
}

export const VisualizationMessage = memo(PureVisualizationMessage);