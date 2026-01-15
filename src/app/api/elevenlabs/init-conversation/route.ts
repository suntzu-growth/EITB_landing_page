// app/api/elevenlabs/init-conversation/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const agentId = process.env.NEXT_PUBLIC_AGENT_ID;
    const apiKey = process.env.ELEVENLABS_API_KEY;

    console.log('[init-conversation] Agent ID present:', !!agentId);
    console.log('[init-conversation] API Key present:', !!apiKey);

    if (!agentId || !apiKey) {
      console.error('[init-conversation] Missing config - agentId:', !!agentId, 'apiKey:', !!apiKey);
      return NextResponse.json(
        { error: 'Missing configuration' },
        { status: 500 }
      );
    }

    // Iniciar una nueva conversación
    const response = await fetch(
      'https://api.elevenlabs.io/v1/convai/conversations',
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_id: agentId,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('[init-conversation] ElevenLabs API error:', response.status, error);
      throw new Error(`Failed to init conversation: ${error}`);
    }

    const data = await response.json();
    return NextResponse.json({
      conversation_id: data.conversation_id
    });

  } catch (error: any) {
    console.error('Error initializing conversation:', error);
    return NextResponse.json(
      { error: 'Failed to initialize conversation', details: error.message },
      { status: 500 }
    );
  }
}