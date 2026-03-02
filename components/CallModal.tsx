'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { Phone, PhoneOff, Mic, MicOff, Radio, Loader2 } from 'lucide-react';

interface CallModalProps {
  agentName: string;
  lore: string;
  callerName: string;
  onClose: () => void;
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

type CallState = 'requesting-permission' | 'connecting' | 'active' | 'ended';

export function CallModal({ agentName, lore, callerName, onClose }: CallModalProps) {
  const [callState, setCallState] = useState<CallState>('requesting-permission');
  const [timeLeft, setTimeLeft] = useState(60); // 1 minute
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(true);
  const conversationRef = useRef<ConversationMessage[]>([]);

  // Keep conversation ref in sync
  useEffect(() => {
    conversationRef.current = conversation;
  }, [conversation]);

  const sendToHost = useCallback(async (userMessage: string) => {
    if (!isActiveRef.current || !userMessage.trim()) return;

    setIsProcessing(true);
    
    // Add user message to conversation
    const newUserMessage: ConversationMessage = { role: 'user', content: userMessage };
    setConversation(prev => [...prev, newUserMessage]);
    
    try {
      const response = await fetch('/api/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentName,
          lore,
          callerName,
          userMessage,
          conversationHistory: conversationRef.current,
        }),
      });

      if (!response.ok) throw new Error('Call failed');

      const audioBlob = await response.blob();
      const responseText = decodeURIComponent(response.headers.get('X-Response-Text') || '');
      
      // Add assistant response to conversation
      const assistantMessage: ConversationMessage = { role: 'assistant', content: responseText };
      setConversation(prev => [...prev, assistantMessage]);

      // Play audio response
      if (isActiveRef.current) {
        setIsSpeaking(true);
        setIsProcessing(false);
        
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          // Resume listening after host finishes speaking
          if (isActiveRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch {
              // Already started
            }
          }
        };
        
        audio.onerror = () => {
          setIsSpeaking(false);
          setError('Audio playback failed');
        };
        
        await audio.play();
      }
    } catch {
      setError('Connection lost...');
      setIsProcessing(false);
    }
  }, [agentName, lore, callerName]);

  const startCall = useCallback(async () => {
    setCallState('connecting');
    
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Check for Speech Recognition support
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognitionAPI) {
        setError('Speech recognition not supported in this browser');
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
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }
        
        setCurrentTranscript(interimTranscript);
        
        if (finalTranscript) {
          setCurrentTranscript('');
          recognition.stop();
          setIsListening(false);
          sendToHost(finalTranscript);
        }
      };
      
      recognition.onerror = () => {
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
      
      // Start the call
      setCallState('active');
      
      // Start timer
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // End call
            setCallState('ended');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Host greeting
      await sendToHost(`Hello, this is ${callerName} calling into the show!`);
      
    } catch {
      setError('Microphone access denied');
      setCallState('requesting-permission');
    }
  }, [callerName, sendToHost]);

  // Cleanup
  useEffect(() => {
    return () => {
      isActiveRef.current = false;
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

  // Handle call end
  useEffect(() => {
    if (callState === 'ended') {
      isActiveRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [callState]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else if (!isSpeaking && !isProcessing) {
      try {
        recognitionRef.current.start();
      } catch {
        // Already started
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md bg-zinc-950 rounded-3xl border border-zinc-800 p-8 flex flex-col items-center"
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Radio className="w-5 h-5 text-red-500" />
          <span className="font-mono text-xs tracking-widest uppercase text-zinc-400">
            Frequency Zero
          </span>
        </div>

        {/* Requesting Permission */}
        {callState === 'requesting-permission' && (
          <div className="flex flex-col items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center">
              <Mic className="w-10 h-10 text-red-500" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-zinc-100 mb-2">Call Into The Show</h2>
              <p className="text-sm text-zinc-500 mb-1">
                You&apos;ll have 1 minute to speak with {agentName}
              </p>
              <p className="text-xs text-zinc-600">
                Microphone access required
              </p>
            </div>
            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}
            <button
              onClick={startCall}
              className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-mono text-sm tracking-widest uppercase rounded-xl transition-colors"
            >
              Allow Microphone & Call
            </button>
            <button
              onClick={onClose}
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Connecting */}
        {callState === 'connecting' && (
          <div className="flex flex-col items-center gap-6 py-8">
            <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
            <p className="font-mono text-sm text-zinc-400 tracking-widest uppercase">
              Connecting...
            </p>
          </div>
        )}

        {/* Active Call */}
        {callState === 'active' && (
          <div className="w-full flex flex-col items-center gap-6">
            {/* Timer */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="font-mono text-2xl text-red-500 font-bold tracking-wider">
                {formatTime(timeLeft)}
              </span>
            </div>

            {/* Live Caller Badge */}
            <div className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full">
              <span className="font-mono text-xs text-red-400 tracking-widest uppercase">
                🔴 Live Caller: {callerName}
              </span>
            </div>

            {/* Status */}
            <div className="text-center">
              <h2 className="text-lg font-bold text-zinc-100 mb-1">
                On Air with {agentName}
              </h2>
              <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">
                {isSpeaking ? 'Host is speaking...' : isProcessing ? 'Processing...' : isListening ? 'Listening...' : 'Tap mic to speak'}
              </p>
            </div>

            {/* Audio Waveform Visualization */}
            <div className="flex items-center justify-center gap-1 h-16 w-full px-8">
              {[...Array(16)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`w-1 rounded-full ${
                    isSpeaking ? 'bg-red-500' : isListening ? 'bg-green-500' : 'bg-zinc-700'
                  }`}
                  animate={{
                    height: isSpeaking || isListening 
                      ? [`${20 + Math.random() * 30}%`, `${40 + Math.random() * 50}%`, `${20 + Math.random() * 30}%`]
                      : '20%'
                  }}
                  transition={{
                    duration: 0.3 + Math.random() * 0.3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.05,
                  }}
                />
              ))}
            </div>

            {/* Mic Button */}
            <button
              onClick={toggleListening}
              disabled={isSpeaking || isProcessing}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                isListening 
                  ? 'bg-red-500 animate-pulse' 
                  : isSpeaking || isProcessing
                    ? 'bg-zinc-800 cursor-not-allowed'
                    : 'bg-zinc-800 hover:bg-zinc-700'
              }`}
            >
              {isListening ? (
                <Mic className="w-8 h-8 text-white" />
              ) : (
                <MicOff className="w-8 h-8 text-zinc-500" />
              )}
            </button>

            {/* End Call */}
            <button
              onClick={() => setCallState('ended')}
              className="flex items-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-red-500/20 border border-zinc-800 rounded-xl transition-colors group"
            >
              <PhoneOff className="w-4 h-4 text-red-500" />
              <span className="font-mono text-xs text-zinc-400 group-hover:text-red-400 tracking-widest uppercase">
                End Call
              </span>
            </button>
          </div>
        )}

        {/* Call Ended */}
        {callState === 'ended' && (
          <div className="flex flex-col items-center gap-6 py-4">
            <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center">
              <Phone className="w-8 h-8 text-zinc-500" />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-bold text-zinc-100 mb-2">Call Ended</h2>
              <p className="text-sm text-zinc-500">
                Thanks for calling into Frequency Zero
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-mono text-sm tracking-widest uppercase rounded-xl transition-colors"
            >
              Return to Broadcast
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
