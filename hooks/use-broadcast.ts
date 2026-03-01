'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseBroadcastOptions {
  agentName: string;
  lore: string;
  autoPlay?: boolean;
}

export function useBroadcast({ agentName, lore, autoPlay = true }: UseBroadcastOptions) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isActiveRef = useRef(true);
  const audioQueueRef = useRef<string[]>([]);
  const isProcessingRef = useRef(false);

  const fetchSegment = useCallback(async (index: number): Promise<{ audioUrl: string; text: string } | null> => {
    try {
      const response = await fetch('/api/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentName, lore, segmentIndex: index }),
      });

      if (!response.ok) {
        throw new Error('Broadcast request failed');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const text = decodeURIComponent(response.headers.get('X-Broadcast-Text') || '');
      
      return { audioUrl, text };
    } catch (err) {
      console.error('Failed to fetch segment:', err);
      return null;
    }
  }, [agentName, lore]);

  const playNextSegment = useCallback(async () => {
    if (!isActiveRef.current || isProcessingRef.current) return;
    
    isProcessingRef.current = true;
    setIsLoading(true);
    setError(null);

    const segment = await fetchSegment(segmentIndex);
    
    if (!segment || !isActiveRef.current) {
      isProcessingRef.current = false;
      setIsLoading(false);
      return;
    }

    setCurrentText(segment.text);
    setIsLoading(false);

    // Create and play audio
    if (audioRef.current) {
      audioRef.current.pause();
      URL.revokeObjectURL(audioRef.current.src);
    }

    const audio = new Audio(segment.audioUrl);
    audioRef.current = audio;

    audio.onplay = () => setIsPlaying(true);
    audio.onpause = () => setIsPlaying(false);
    audio.onended = () => {
      URL.revokeObjectURL(segment.audioUrl);
      isProcessingRef.current = false;
      if (isActiveRef.current) {
        setSegmentIndex(prev => prev + 1);
      }
    };
    audio.onerror = () => {
      setError('Audio playback failed');
      isProcessingRef.current = false;
    };

    try {
      await audio.play();
    } catch (err) {
      console.error('Playback error:', err);
      setError('Click to start broadcast');
      isProcessingRef.current = false;
    }
  }, [segmentIndex, fetchSegment]);

  // Start playing when segment index changes
  useEffect(() => {
    if (autoPlay && isActiveRef.current) {
      playNextSegment();
    }
  }, [segmentIndex, autoPlay, playNextSegment]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isActiveRef.current = false;
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }
    };
  }, []);

  const play = useCallback(() => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch(console.error);
    } else if (!isProcessingRef.current) {
      playNextSegment();
    }
  }, [playNextSegment]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const stop = useCallback(() => {
    isActiveRef.current = false;
    if (audioRef.current) {
      audioRef.current.pause();
      URL.revokeObjectURL(audioRef.current.src);
      audioRef.current = null;
    }
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  const restart = useCallback(() => {
    stop();
    isActiveRef.current = true;
    setSegmentIndex(0);
    setCurrentText('');
    setError(null);
  }, [stop]);

  return {
    isPlaying,
    isLoading,
    currentText,
    error,
    segmentIndex,
    play,
    pause,
    stop,
    restart,
  };
}
