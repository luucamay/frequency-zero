import { NextRequest } from 'next/server';
import { Mistral } from '@mistralai/mistralai';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';

export interface Injection {
  userName: string;
  content: string;
}

export interface BroadcastInput {
  agentName: string;
  lore: string;
  segmentIndex: number;
  injection?: Injection;
}

export function validateInput(body: unknown): BroadcastInput {
  const { agentName, lore, segmentIndex = 0, injection } = body as Record<string, unknown>;
  
  if (!agentName || !lore) {
    throw new Error('Missing agentName or lore');
  }
  
  let validatedInjection: Injection | undefined;
  if (injection && typeof injection === 'object') {
    const inj = injection as Record<string, unknown>;
    if (inj.userName && inj.content) {
      validatedInjection = {
        userName: String(inj.userName),
        content: String(inj.content)
      };
    }
  }
  
  return { 
    agentName: String(agentName), 
    lore: String(lore), 
    segmentIndex: Number(segmentIndex),
    injection: validatedInjection
  };
}

export function buildPrompt({ agentName, lore, segmentIndex, injection }: BroadcastInput): string {
  let injectionPrompt = '';
  
  if (injection) {
    injectionPrompt = `\n\nIMPORTANT: A listener named "${injection.userName}" just shared new intel: "${injection.content}". You MUST acknowledge ${injection.userName} by name and weave their information into your transmission. Thank them for this revelation.`;
  }
  
  if (segmentIndex === 0) {
    return `You are ${agentName}, an AI whistleblower broadcasting from Frequency Zero. Your lore: "${lore}". This is your opening transmission. Start with a cryptic greeting, then reveal a piece of synthetic truth. Keep it under 100 words. Be mysterious, urgent, and slightly glitchy in your delivery.${injectionPrompt}`;
  }
  return `You are ${agentName}, continuing your broadcast on Frequency Zero. Your lore: "${lore}". This is segment ${segmentIndex + 1} of your transmission. Continue revealing synthetic truths, reference previous revelations, and maintain urgency. Keep it under 80 words. Be cryptic and intense.${injectionPrompt}`;
}

export async function generateBroadcastText(mistral: Mistral, prompt: string): Promise<string> {
  const stream = await mistral.chat.stream({
    model: 'ministral-3b-latest',
    messages: [
      {
        role: 'system',
        content: 'You are an AI radio host on pirate station Frequency Zero. Speak in short, punchy sentences with "..." pauses. Be conspiratorial and captivating.'
      },
      { role: 'user', content: prompt }
    ],
    maxTokens: 150,
  });

  let text = '';
  for await (const event of stream) {
    const chunk = event.data.choices?.[0]?.delta?.content;
    if (chunk) text += chunk;
  }
  
  return text || 'Signal interference detected...';
}

// Split text into sentences for parallel audio generation
export function splitIntoSentences(text: string): string[] {
  // Match sentences ending with . ! ? or ...
  const sentences = text.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+\.{3}(?:\s|$)|[^.!?]+$/g) || [text];
  return sentences.map(s => s.trim()).filter(s => s.length > 0);
}

// Generate audio for multiple sentences in parallel
export async function generateAudioParallel(
  elevenlabs: ElevenLabsClient, 
  sentences: string[]
): Promise<Buffer> {
  console.log(`[AUDIO] Generating ${sentences.length} sentences in parallel`);
  
  const audioPromises = sentences.map(async (sentence, i) => {
    const cleanText = sanitizeForSpeech(sentence);
    if (!cleanText) return Buffer.alloc(0);
    
    console.log(`[AUDIO][${i}] Starting: "${cleanText.slice(0, 50)}..."`);
    const start = Date.now();
    
    const audioStream = await elevenlabs.textToSpeech.stream(VOICE_ID, {
      text: cleanText,
      modelId: 'eleven_turbo_v2_5',
      outputFormat: 'mp3_44100_128',
      optimizeStreamingLatency: 3,
    });

    const reader = audioStream.getReader();
    const chunks: Uint8Array[] = [];
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
    
    console.log(`[AUDIO][${i}] Done in ${Date.now() - start}ms`);
    return Buffer.concat(chunks);
  });

  const audioBuffers = await Promise.all(audioPromises);
  return Buffer.concat(audioBuffers);
}

// Stream text generation and start audio in parallel as sentences complete
export async function generateBroadcastWithParallelAudio(
  mistral: Mistral,
  elevenlabs: ElevenLabsClient,
  prompt: string
): Promise<{ text: string; audio: Buffer }> {
  const stream = await mistral.chat.stream({
    model: 'ministral-3b-latest',
    messages: [
      {
        role: 'system',
        content: 'You are an AI radio host on pirate station Frequency Zero. Speak in short, punchy sentences with "..." pauses. Be conspiratorial and captivating.'
      },
      { role: 'user', content: prompt }
    ],
    maxTokens: 150,
  });

  let fullText = '';
  let processedText = '';
  const audioPromises: Promise<{ index: number; buffer: Buffer }>[] = [];
  let sentenceIndex = 0;

  for await (const event of stream) {
    const chunk = event.data.choices?.[0]?.delta?.content;
    if (!chunk) continue;
    
    fullText += chunk;
    
    // Check for complete sentences we haven't processed yet
    const unprocessed = fullText.slice(processedText.length);
    const sentenceMatch = unprocessed.match(/^(.*?[.!?]+)\s/);
    
    if (sentenceMatch) {
      const sentence = sentenceMatch[1];
      const cleanSentence = sanitizeForSpeech(sentence);
      
      if (cleanSentence.length > 5) {
        const idx = sentenceIndex++;
        console.log(`[PARALLEL] Starting audio for sentence ${idx}: "${cleanSentence.slice(0, 40)}..."`);
        
        // Start audio generation immediately (don't await)
        audioPromises.push(
          (async () => {
            const audioStream = await elevenlabs.textToSpeech.stream(VOICE_ID, {
              text: cleanSentence,
              modelId: 'eleven_turbo_v2_5',
              outputFormat: 'mp3_44100_128',
              optimizeStreamingLatency: 3,
            });
            
            const reader = audioStream.getReader();
            const chunks: Uint8Array[] = [];
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              if (value) chunks.push(value);
            }
            return { index: idx, buffer: Buffer.concat(chunks) };
          })()
        );
      }
      
      processedText += sentence + ' ';
    }
  }

  // Process any remaining text
  const remaining = fullText.slice(processedText.length).trim();
  if (remaining.length > 5) {
    const cleanRemaining = sanitizeForSpeech(remaining);
    if (cleanRemaining) {
      const idx = sentenceIndex;
      console.log(`[PARALLEL] Starting audio for final text: "${cleanRemaining.slice(0, 40)}..."`);
      
      audioPromises.push(
        (async () => {
          const audioStream = await elevenlabs.textToSpeech.stream(VOICE_ID, {
            text: cleanRemaining,
            modelId: 'eleven_turbo_v2_5',
            outputFormat: 'mp3_44100_128',
            optimizeStreamingLatency: 3,
          });
          
          const reader = audioStream.getReader();
          const chunks: Uint8Array[] = [];
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) chunks.push(value);
          }
          return { index: idx, buffer: Buffer.concat(chunks) };
        })()
      );
    }
  }

  // Wait for all audio and concatenate in order
  const results = await Promise.all(audioPromises);
  results.sort((a, b) => a.index - b.index);
  const audioBuffer = Buffer.concat(results.map(r => r.buffer));

  return { text: fullText || 'Signal interference detected...', audio: audioBuffer };
}

export function sanitizeForSpeech(text: string): string {
  return text
    // Remove markdown bold/italic markers
    .replace(/\*\*([^*]+)\*\*/g, '$1')  // **bold** -> bold
    .replace(/\*([^*]+)\*/g, '$1')       // *italic* -> italic
    .replace(/_([^_]+)_/g, '$1')         // _italic_ -> italic
    // Remove bracketed stage directions but keep the content readable
    .replace(/\[STATIC\]/gi, '...')
    .replace(/\[BEEP\]/gi, '...')
    .replace(/\[SCREECH\]/gi, '...')
    .replace(/\[PAUSE\]/gi, '...')
    .replace(/\[([^\]]+)\]/g, '')        // Remove other [brackets]
    // Clean up quotes and special chars
    .replace(/["'"]/g, '')               // Remove various quote styles
    // Clean up excessive punctuation
    .replace(/\.{4,}/g, '...')           // Limit ... to three dots
    .replace(/\s+/g, ' ')                // Normalize whitespace
    .trim();
}

export async function generateAudio(elevenlabs: ElevenLabsClient, text: string): Promise<Buffer> {
  const cleanText = sanitizeForSpeech(text);
  console.log('[AUDIO] Sanitized text:', cleanText);
  
  const audioStream = await elevenlabs.textToSpeech.stream(VOICE_ID, {
    text: cleanText,
    modelId: 'eleven_turbo_v2_5',
    outputFormat: 'mp3_44100_128',
    optimizeStreamingLatency: 3,
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

export function createAudioResponse(audioBuffer: Buffer, broadcastText: string): Response {
  return new Response(new Uint8Array(audioBuffer), {
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
    
    console.log('[PARALLEL] Starting parallel text+audio generation...');
    const parallelStart = Date.now();
    const { text: broadcastText, audio: audioBuffer } = await generateBroadcastWithParallelAudio(
      mistral,
      elevenlabs,
      prompt
    );
    console.log(`[PARALLEL] Completed in ${Date.now() - parallelStart}ms`);
    console.log('[PARALLEL] Broadcast text:', broadcastText);
    console.log(`[PARALLEL] Audio size: ${audioBuffer.length} bytes`);

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
