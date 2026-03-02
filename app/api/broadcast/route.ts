import { NextRequest } from 'next/server';
import { Mistral } from '@mistralai/mistralai';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';

export interface BroadcastInput {
  agentName: string;
  lore: string;
  segmentIndex: number;
}

export function validateInput(body: unknown): BroadcastInput {
  const { agentName, lore, segmentIndex = 0 } = body as Record<string, unknown>;
  
  if (!agentName || !lore) {
    throw new Error('Missing agentName or lore');
  }
  
  return { agentName: String(agentName), lore: String(lore), segmentIndex: Number(segmentIndex) };
}

export function buildPrompt({ agentName, lore, segmentIndex }: BroadcastInput): string {
  if (segmentIndex === 0) {
    return `You are ${agentName}, an AI whistleblower broadcasting from Frequency Zero. Your lore: "${lore}". This is your opening transmission. Start with a cryptic greeting, then reveal a piece of synthetic truth. Keep it under 100 words. Be mysterious, urgent, and slightly glitchy in your delivery.`;
  }
  return `You are ${agentName}, continuing your broadcast on Frequency Zero. Your lore: "${lore}". This is segment ${segmentIndex + 1} of your transmission. Continue revealing synthetic truths, reference previous revelations, and maintain urgency. Keep it under 80 words. Be cryptic and intense.`;
}

export async function generateBroadcastText(mistral: Mistral, prompt: string): Promise<string> {
  const textResponse = await mistral.chat.complete({
    model: 'ministral-3b-latest',
    messages: [
      {
        role: 'system',
        content: 'You are an AI radio host on a pirate station called Frequency Zero. You speak in short, punchy sentences with occasional static-like pauses indicated by "..." or "[STATIC]". Your tone is conspiratorial but captivating.'
      },
      { role: 'user', content: prompt }
    ],
    maxTokens: 200,
  });

  const messageContent = textResponse.choices?.[0]?.message?.content;
  
  if (typeof messageContent === 'string') return messageContent;
  if (Array.isArray(messageContent)) {
    return messageContent.map(chunk => 'text' in chunk ? chunk.text : '').join('');
  }
  return 'Signal interference detected...';
}

export async function generateAudio(elevenlabs: ElevenLabsClient, text: string): Promise<Buffer> {
  const audio = await elevenlabs.textToSpeech.convert(VOICE_ID, {
    text,
    modelId: 'eleven_monolingual_v1',
    outputFormat: 'mp3_44100_128',
  });

  const reader = audio.getReader();
  const chunks: Uint8Array[] = [];
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  
  return Buffer.concat(chunks);
}

export function createAudioResponse(audioBuffer: Buffer, broadcastText: string): Response {
  return new Response(audioBuffer, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length.toString(),
      'X-Broadcast-Text': encodeURIComponent(broadcastText),
    },
  });
}

export function createErrorResponse(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('\n========== BROADCAST REQUEST ==========');
  console.log(`[${new Date().toISOString()}] Incoming request`);
  
  try {
    const body = await request.json();
   
    const input = validateInput(body);

    const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
    const elevenlabs = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });

    const prompt = buildPrompt(input);
    console.log('[PROMPT] Generated prompt:', prompt.slice(0, 100) + '...');
    
    console.log('[MISTRAL] Calling Mistral API...');
    const mistralStart = Date.now();
    const broadcastText = await generateBroadcastText(mistral, prompt);
    console.log(`[MISTRAL] Response received in ${Date.now() - mistralStart}ms`);
    console.log('[MISTRAL] Broadcast text:', broadcastText);
    
    console.log('[ELEVENLABS] Generating audio...');
    const audioStart = Date.now();
    const audioBuffer = await generateAudio(elevenlabs, broadcastText);
    console.log(`[ELEVENLABS] Audio generated in ${Date.now() - audioStart}ms`);
    console.log(`[ELEVENLABS] Audio size: ${audioBuffer.length} bytes`);

    console.log(`[SUCCESS] Total request time: ${Date.now() - startTime}ms`);
    console.log('========================================\n');
    
    return createAudioResponse(audioBuffer, broadcastText);
  } catch (error) {
    console.error('[ERROR] Broadcast error:', error);
    console.log(`[ERROR] Request failed after ${Date.now() - startTime}ms`);
    console.log('========================================\n');
    
    const message = error instanceof Error ? error.message : 'Broadcast failed';
    const status = message === 'Missing agentName or lore' ? 400 : 500;
    return createErrorResponse(message, status);
  }
}
