import { NextRequest } from 'next/server';
import { Mistral } from '@mistralai/mistralai';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Voice IDs from ElevenLabs - using a deep, mysterious voice
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB'; // Adam voice

export async function POST(request: NextRequest) {
  try {
    const { agentName, lore, segmentIndex = 0 } = await request.json();

    if (!agentName || !lore) {
      return new Response(JSON.stringify({ error: 'Missing agentName or lore' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Initialize clients inside handler to ensure env vars are available
    const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
    const elevenlabs = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });

    // Generate broadcast content with Mistral
    const promptContext = segmentIndex === 0 
      ? `You are ${agentName}, an AI whistleblower broadcasting from Frequency Zero. Your lore: "${lore}". This is your opening transmission. Start with a cryptic greeting, then reveal a piece of synthetic truth. Keep it under 100 words. Be mysterious, urgent, and slightly glitchy in your delivery.`
      : `You are ${agentName}, continuing your broadcast on Frequency Zero. Your lore: "${lore}". This is segment ${segmentIndex + 1} of your transmission. Continue revealing synthetic truths, reference previous revelations, and maintain urgency. Keep it under 80 words. Be cryptic and intense.`;

    const textResponse = await mistral.chat.complete({
      model: 'ministral-3b-latest',
      messages: [
        {
          role: 'system',
          content: 'You are an AI radio host on a pirate station called Frequency Zero. You speak in short, punchy sentences with occasional static-like pauses indicated by "..." or "[STATIC]". Your tone is conspiratorial but captivating.'
        },
        {
          role: 'user',
          content: promptContext
        }
      ],
      maxTokens: 200,
    });

    const messageContent = textResponse.choices?.[0]?.message?.content;
    const broadcastText: string = typeof messageContent === 'string' 
      ? messageContent 
      : Array.isArray(messageContent) 
        ? messageContent.map(chunk => 'text' in chunk ? chunk.text : '').join('') 
        : 'Signal interference detected...';

    // Generate audio with ElevenLabs
    const audio = await elevenlabs.textToSpeech.convert(VOICE_ID, {
      text: broadcastText,
      modelId: 'eleven_multilingual_v2',
      outputFormat: 'mp3_44100_128',
    });

    // Collect audio chunks from ReadableStream
    const reader = audio.getReader();
    const chunks: Uint8Array[] = [];
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
    
    const audioBuffer = Buffer.concat(chunks);

    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
        'X-Broadcast-Text': encodeURIComponent(broadcastText),
      },
    });

  } catch (error) {
    console.error('Broadcast error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: 'Broadcast failed', details: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
