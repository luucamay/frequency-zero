'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseCallModeOptions {
  agentName: string;
  lore: string;
  callerName: string;
  onCallEnd?: () => void;
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export type CallState = 'inactive' | 'requesting-permission' | 'active' | 'ended';

export function useCallMode({ agentName, lore, callerName, onCallEnd }: UseCallModeOptions) {
  const [callState, setCallState] = useState<CallState>('inactive');
  const [timeLeft, setTimeLeft] = useState(60);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(false);
  const conversationRef = useRef<ConversationMessage[]>([]);
  const accumulatedTranscriptRef = useRef<string>('');
  const wantsToListenRef = useRef(false); // Track if user wants mic to stay open

  const sendToHost = useCallback(async (userMessage: string) => {
    if (!isActiveRef.current || !userMessage.trim()) return;

    // Stop auto-restart while processing
    wantsToListenRef.current = false;
    setIsProcessing(true);
    
    // Add user message to conversation
    conversationRef.current.push({ role: 'user', content: userMessage });
    
    try {
      const response = await fetch('/api/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentName,
          lore,
          callerName,
          userMessage,
          conversationHistory: conversationRef.current.slice(0, -1), // Exclude current message
        }),
      });

      if (!response.ok) throw new Error('Call failed');

      const audioBlob = await response.blob();
      const responseText = decodeURIComponent(response.headers.get('X-Response-Text') || '');
      
      // Validate audio blob
      if (audioBlob.size === 0) {
        throw new Error('Empty audio response');
      }
      
      // Add assistant response to conversation
      conversationRef.current.push({ role: 'assistant', content: responseText });

      // Play audio response
      if (isActiveRef.current) {
        setIsSpeaking(true);
        setIsProcessing(false);
        
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.volume = 1.0; // Ensure full volume
        audioRef.current = audio;
        
        // Wait for audio to be ready before playing
        audio.oncanplaythrough = async () => {
          try {
            await audio.play();
          } catch (playError) {
            console.error('Audio play failed:', playError);
            setIsSpeaking(false);
            setError('Tap to hear host response');
          }
        };
        
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          // User can tap mic to speak again (toggle behavior)
        };
        
        audio.onerror = (e) => {
          console.error('Audio error:', e);
          setIsSpeaking(false);
          setError('Audio playback failed');
          URL.revokeObjectURL(audioUrl);
        };
        
        // Load the audio
        audio.load();
      }
    } catch (err) {
      console.error('sendToHost error:', err);
      setError('Connection lost...');
      setIsProcessing(false);
      setIsSpeaking(false);
    }
  }, [agentName, lore, callerName]);

  const startCall = useCallback(async () => {
    setCallState('requesting-permission');
    setError(null);
    
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Check for Speech Recognition support
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognitionAPI) {
        setError('Speech recognition not supported');
        setCallState('inactive');
        return;
      }

      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }
        
        // Accumulate final transcript (don't stop - keep listening until user taps again)
        if (finalTranscript) {
          accumulatedTranscriptRef.current += ' ' + finalTranscript;
          accumulatedTranscriptRef.current = accumulatedTranscriptRef.current.trim();
        }
      };
      
      recognition.onerror = (event) => {
        // Only stop for terminal errors, ignore transient ones
        const errorEvent = event as Event & { error?: string };
        const terminalErrors = ['not-allowed', 'service-not-allowed', 'audio-capture'];
        if (terminalErrors.includes(errorEvent.error || '')) {
          setIsListening(false);
          wantsToListenRef.current = false;
        }
        // For 'no-speech', 'aborted', 'network' etc - let onend handle restart
      };
      
      recognition.onend = () => {
        // Auto-restart if user still wants to listen
        if (wantsToListenRef.current && isActiveRef.current && recognitionRef.current) {
          // Small delay before restart to avoid rapid cycling
          setTimeout(() => {
            if (wantsToListenRef.current && isActiveRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch {
                // Failed to restart - keep isListening true, will retry on next onend
              }
            } else {
              setIsListening(false);
            }
          }, 100);
        } else {
          setIsListening(false);
        }
      };
      
      recognitionRef.current = recognition;
      isActiveRef.current = true;
      
      // Start the call
      setCallState('active');
      setTimeLeft(60);
      conversationRef.current = [];
      
      // Start timer - use inline endCall logic to avoid circular dependency
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Inline end call logic
            isActiveRef.current = false;
            wantsToListenRef.current = false;
            setCallState('ended');
            
            if (recognitionRef.current) {
              recognitionRef.current.abort();
              recognitionRef.current = null;
            }
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current = null;
            }
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            
            setIsListening(false);
            setIsSpeaking(false);
            setIsProcessing(false);
            
            setTimeout(() => {
              onCallEnd?.();
              setCallState('inactive');
            }, 2000);
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Host greeting
      await sendToHost(`Hello, this is ${callerName} calling into the show!`);
      
    } catch {
      setError('Microphone access denied');
      setCallState('inactive');
    }
  }, [callerName, sendToHost, onCallEnd]);

  const endCall = useCallback(() => {
    isActiveRef.current = false;
    wantsToListenRef.current = false;
    setCallState('ended');
    
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setIsListening(false);
    setIsSpeaking(false);
    setIsProcessing(false);
    
    // Notify parent after short delay
    setTimeout(() => {
      onCallEnd?.();
      setCallState('inactive');
    }, 2000);
  }, [onCallEnd]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current || callState !== 'active') return;
    
    if (isListening) {
      // User wants to stop - set flag before stopping
      wantsToListenRef.current = false;
      recognitionRef.current.stop();
      setIsListening(false);
      
      // Send what was accumulated
      const transcript = accumulatedTranscriptRef.current.trim();
      if (transcript) {
        sendToHost(transcript);
      }
      accumulatedTranscriptRef.current = '';
    } else if (!isSpeaking && !isProcessing) {
      // User wants to start listening
      wantsToListenRef.current = true;
      setIsListening(true); // Set immediately for UI responsiveness
      accumulatedTranscriptRef.current = '';
      try {
        recognitionRef.current.start();
      } catch {
        // If start fails, onend will handle restart via wantsToListenRef
      }
    }
  }, [callState, isListening, isSpeaking, isProcessing, sendToHost]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isActiveRef.current = false;
      wantsToListenRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Retry playing audio if autoplay failed
  const retryPlay = useCallback(async () => {
    if (audioRef.current && error) {
      setError(null);
      try {
        await audioRef.current.play();
        setIsSpeaking(true);
      } catch {
        setError('Audio playback failed');
      }
    }
  }, [error]);

  return {
    callState,
    timeLeft,
    isListening,
    isSpeaking,
    isProcessing,
    error,
    startCall,
    endCall,
    toggleListening,
    retryPlay,
  };
}
