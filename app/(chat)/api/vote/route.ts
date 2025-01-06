import { auth } from '@/app/(auth)/auth';
import { getVotesByChatId, voteMessage } from '@/lib/db/queries';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId');

  if (!chatId) {
    return new Response('chatId is required', { status: 400 });
  }

  // Return empty array since we're not using DB
  return Response.json([], { status: 200 });
}

export async function PATCH(request: Request) {
  const { chatId, messageId, type } = await request.json();

  if (!chatId || !messageId || !type) {
    return new Response('messageId and type are required', { status: 400 });
  }

  // Just return success since we're not using DB
  return new Response('Message voted', { status: 200 });
}
