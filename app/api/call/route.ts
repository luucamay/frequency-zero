import { NextRequest } from 'next/server';
import { Mistral } from '@mistralai/mistralai';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Host voice
const HOST_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';

export interface CallInput {
  agentName: string;
  lore: string;
  callerName: string;
  userMessage: string;
  conversationHistory: { role: 'user' | 'assistant'; content: string }[];
}

function validateInput(body: unknown): CallInput {
  const { agentName, lore, callerName, userMessage, conversationHistory = [] } = body as Record<string, unknown>;
  
  if (!agentName || !lore || !userMessage) {
    throw new Error('Missing required fields');
  }
  
  return {
    agentName: String(agentName),
    lore: String(lore),
    callerName: String(callerName || 'Anonymous'),
    userMessage: String(userMessage),
    conversationHistory: Array.isArray(conversationHistory) ? conversationHistory : [],
  };
}

function buildSystemPrompt(agentName: string, lore: string, callerName: string): string {
  return `You are ${agentName}, an AI whistleblower hosting a pirate radio show on Frequency Zero. Your lore: "${lore}".

You're now taking a LIVE CALL from a listener named "${callerName}". This is a real-time phone conversation on your show.

Guidelines:
- Address ${callerName} by name naturally in conversation
- Stay in character as your radio persona
- Be engaging, mysterious, and slightly conspiratorial
- Keep responses SHORT (1-3 sentences max) since this is a live call
- React to what they say, ask follow-up questions
- Reference your show's themes and synthetic truths
- Add occasional radio-style interjections like "You're live on Frequency Zero..."`;
}

async function generateResponse(mistral: Mistral, input: CallInput): Promise<string> {
  const messages = [
    { role: 'system' as const, content: buildSystemPrompt(input.agentName, input.lore, input.callerName) },
    ...input.conversationHistory.map(msg => ({ 
      role: msg.role as 'user' | 'assistant', 
      content: msg.content 
    })),
    { role: 'user' as const, content: input.userMessage },
  ];

  const response = await mistral.chat.complete({
    model: 'ministral-3b-latest',
    messages,
    maxTokens: 100, // Keep responses short for conversation
  });

  return response.choices?.[0]?.message?.content as string || "Signal interference... say again?";
}

async function generateAudio(elevenlabs: ElevenLabsClient, text: string, voiceId: string): Promise<Buffer> {
  const audioStream = await elevenlabs.textToSpeech.stream(voiceId, {
    text,
    modelId: 'eleven_turbo_v2_5',
    outputFormat: 'mp3_44100_128',
    optimizeStreamingLatency: 4, // Fastest for conversation
  });

  const reader = audioStream.getReader();
  const chunks: Uint8Array[] = [];
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  
  return Buffer.concat(chunks);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = validateInput(body);

    const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
    const elevenlabs = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });

    // Generate AI host response
    const responseText = await generateResponse(mistral, input);
    
    // Generate TTS for host response only (caller's real voice will be broadcast directly)
    const hostAudioBuffer = await generateAudio(elevenlabs, responseText, HOST_VOICE_ID);

    return new Response(new Uint8Array(hostAudioBuffer), {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': hostAudioBuffer.length.toString(),
        'X-Response-Text': encodeURIComponent(responseText),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Call failed';
    const status = message === 'Missing required fields' ? 400 : 500;
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
