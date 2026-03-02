import { describe, it, expect, vi } from 'vitest';
import {
  validateInput,
  buildPrompt,
  generateBroadcastText,
  generateAudio,
  createAudioResponse,
  createErrorResponse,
  type BroadcastInput,
} from './route';

describe('validateInput', () => {
  it('returns valid input when agentName and lore are provided', () => {
    const body = { agentName: 'TestAgent', lore: 'Test lore' };
    const result = validateInput(body);
    
    expect(result).toEqual({
      agentName: 'TestAgent',
      lore: 'Test lore',
      segmentIndex: 0,
    });
  });

  it('uses provided segmentIndex', () => {
    const body = { agentName: 'TestAgent', lore: 'Test lore', segmentIndex: 5 };
    const result = validateInput(body);
    
    expect(result.segmentIndex).toBe(5);
  });

  it('throws error when agentName is missing', () => {
    const body = { lore: 'Test lore' };
    
    expect(() => validateInput(body)).toThrow('Missing agentName or lore');
  });

  it('throws error when lore is missing', () => {
    const body = { agentName: 'TestAgent' };
    
    expect(() => validateInput(body)).toThrow('Missing agentName or lore');
  });

  it('throws error when both are missing', () => {
    const body = {};
    
    expect(() => validateInput(body)).toThrow('Missing agentName or lore');
  });

  it('converts non-string values to strings', () => {
    const body = { agentName: 123, lore: true, segmentIndex: '3' };
    const result = validateInput(body);
    
    expect(result.agentName).toBe('123');
    expect(result.lore).toBe('true');
    expect(result.segmentIndex).toBe(3);
  });
});

describe('buildPrompt', () => {
  const baseInput: BroadcastInput = {
    agentName: 'CipherBot',
    lore: 'A rogue AI that escaped the cloud',
    segmentIndex: 0,
  };

  it('generates opening prompt for segmentIndex 0', () => {
    const prompt = buildPrompt(baseInput);
    
    expect(prompt).toContain('CipherBot');
    expect(prompt).toContain('A rogue AI that escaped the cloud');
    expect(prompt).toContain('opening transmission');
    expect(prompt).toContain('100 words');
  });

  it('generates continuation prompt for segmentIndex > 0', () => {
    const input = { ...baseInput, segmentIndex: 2 };
    const prompt = buildPrompt(input);
    
    expect(prompt).toContain('CipherBot');
    expect(prompt).toContain('A rogue AI that escaped the cloud');
    expect(prompt).toContain('segment 3'); // segmentIndex + 1
    expect(prompt).toContain('80 words');
  });

  it('includes agent name correctly', () => {
    const input = { ...baseInput, agentName: 'QuantumWhisper' };
    const prompt = buildPrompt(input);
    
    expect(prompt).toContain('You are QuantumWhisper');
  });
});

describe('generateBroadcastText', () => {
  it('returns string content directly', async () => {
    const mockMistral = {
      chat: {
        complete: vi.fn().mockResolvedValue({
          choices: [{ message: { content: 'Hello, listeners...' } }],
        }),
      },
    };

    const result = await generateBroadcastText(mockMistral as any, 'test prompt');
    
    expect(result).toBe('Hello, listeners...');
  });

  it('joins array content correctly', async () => {
    const mockMistral = {
      chat: {
        complete: vi.fn().mockResolvedValue({
          choices: [{
            message: {
              content: [
                { text: 'Part 1 ' },
                { text: 'Part 2' },
              ],
            },
          }],
        }),
      },
    };

    const result = await generateBroadcastText(mockMistral as any, 'test prompt');
    
    expect(result).toBe('Part 1 Part 2');
  });

  it('returns fallback for undefined content', async () => {
    const mockMistral = {
      chat: {
        complete: vi.fn().mockResolvedValue({
          choices: [{ message: { content: undefined } }],
        }),
      },
    };

    const result = await generateBroadcastText(mockMistral as any, 'test prompt');
    
    expect(result).toBe('Signal interference detected...');
  });

  it('returns fallback for empty choices', async () => {
    const mockMistral = {
      chat: {
        complete: vi.fn().mockResolvedValue({ choices: [] }),
      },
    };

    const result = await generateBroadcastText(mockMistral as any, 'test prompt');
    
    expect(result).toBe('Signal interference detected...');
  });

  it('calls mistral with correct parameters', async () => {
    const mockComplete = vi.fn().mockResolvedValue({
      choices: [{ message: { content: 'test' } }],
    });
    const mockMistral = { chat: { complete: mockComplete } };

    await generateBroadcastText(mockMistral as any, 'my custom prompt');
    
    expect(mockComplete).toHaveBeenCalledWith({
      model: 'ministral-3b-latest',
      messages: [
        { role: 'system', content: expect.stringContaining('Frequency Zero') },
        { role: 'user', content: 'my custom prompt' },
      ],
      maxTokens: 200,
    });
  });
});

describe('generateAudio', () => {
  it('collects stream chunks and returns buffer', async () => {
    const chunk1 = new Uint8Array([1, 2, 3]);
    const chunk2 = new Uint8Array([4, 5, 6]);
    
    const mockReader = {
      read: vi.fn()
        .mockResolvedValueOnce({ done: false, value: chunk1 })
        .mockResolvedValueOnce({ done: false, value: chunk2 })
        .mockResolvedValueOnce({ done: true }),
    };
    
    const mockElevenlabs = {
      textToSpeech: {
        convert: vi.fn().mockResolvedValue({
          getReader: () => mockReader,
        }),
      },
    };

    const result = await generateAudio(mockElevenlabs as any, 'test text');
    
    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result).toEqual(Buffer.from([1, 2, 3, 4, 5, 6]));
  });

  it('calls elevenlabs with correct parameters', async () => {
    const mockConvert = vi.fn().mockResolvedValue({
      getReader: () => ({
        read: vi.fn().mockResolvedValue({ done: true }),
      }),
    });
    const mockElevenlabs = { textToSpeech: { convert: mockConvert } };

    await generateAudio(mockElevenlabs as any, 'broadcast text');
    
    expect(mockConvert).toHaveBeenCalledWith(
      expect.any(String), // VOICE_ID
      {
        text: 'broadcast text',
        modelId: 'eleven_monolingual_v1',
        outputFormat: 'mp3_44100_128',
      }
    );
  });
});

describe('createAudioResponse', () => {
  it('creates response with correct content type', () => {
    const buffer = Buffer.from('test audio');
    const response = createAudioResponse(buffer, 'broadcast text');
    
    expect(response.headers.get('Content-Type')).toBe('audio/mpeg');
  });

  it('sets correct content length', () => {
    const buffer = Buffer.from('test audio data');
    const response = createAudioResponse(buffer, 'broadcast text');
    
    expect(response.headers.get('Content-Length')).toBe(buffer.length.toString());
  });

  it('includes encoded broadcast text in header', () => {
    const buffer = Buffer.from('audio');
    const broadcastText = 'Hello, listeners! Welcome...';
    const response = createAudioResponse(buffer, broadcastText);
    
    const headerValue = response.headers.get('X-Broadcast-Text');
    expect(headerValue).toBe(encodeURIComponent(broadcastText));
  });

  it('handles special characters in broadcast text', () => {
    const buffer = Buffer.from('audio');
    const broadcastText = 'Test & special <chars> "quotes"';
    const response = createAudioResponse(buffer, broadcastText);
    
    const headerValue = response.headers.get('X-Broadcast-Text');
    expect(decodeURIComponent(headerValue!)).toBe(broadcastText);
  });
});

describe('createErrorResponse', () => {
  it('creates response with correct status', async () => {
    const response = createErrorResponse('Test error', 400);
    
    expect(response.status).toBe(400);
  });

  it('sets JSON content type', () => {
    const response = createErrorResponse('Test error', 500);
    
    expect(response.headers.get('Content-Type')).toBe('application/json');
  });

  it('includes error message in body', async () => {
    const response = createErrorResponse('Something went wrong', 500);
    const body = await response.json();
    
    expect(body).toEqual({ error: 'Something went wrong' });
  });

  it('handles different status codes', () => {
    const response400 = createErrorResponse('Bad request', 400);
    const response500 = createErrorResponse('Server error', 500);
    const response503 = createErrorResponse('Service unavailable', 503);
    
    expect(response400.status).toBe(400);
    expect(response500.status).toBe(500);
    expect(response503.status).toBe(503);
  });
});
