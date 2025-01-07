import { Message } from 'ai';

export function convertToCoreMessages(messages: Message[]) {
  return messages.map(message => ({
    content: message.content,
    role: message.role
  }));
}

export function getMostRecentUserMessage(messages: Message[]) {
  return messages.findLast(message => message.role === 'user');
}