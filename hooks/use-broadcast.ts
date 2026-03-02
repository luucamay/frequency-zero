'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseBroadcastOptions {
  agentName: string;
  lore: string;
  autoPlay?: boolean;
}

interface CachedSegment {
  audioUrl: string;
  text: string;
  index: number;
}

export function useBroadcast({ agentName, lore, autoPlay = true }: UseBroadcastOptions) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isActiveRef = useRef(true);
  const isProcessingRef = useRef(false);
  
  // Pre-caching refs
  const cacheRef = useRef<Map<number, CachedSegment>>(new Map());
  const prefetchingRef = useRef<Set<number>>(new Set());

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
    } catch {
      return null;
    }
  }, [agentName, lore]);

  // Prefetch next segment in background
  const prefetchSegment = useCallback(async (index: number) => {
    // Skip if already cached or being fetched
    if (cacheRef.current.has(index) || prefetchingRef.current.has(index)) {
      return;
    }

    prefetchingRef.current.add(index);
    
    const segment = await fetchSegment(index);
    
    prefetchingRef.current.delete(index);
    
    if (segment && isActiveRef.current) {
      cacheRef.current.set(index, { ...segment, index });
    }
  }, [fetchSegment]);

  const playNextSegment = useCallback(async () => {
    if (!isActiveRef.current || isProcessingRef.current) {
      return;
    }
    
    isProcessingRef.current = true;
    setError(null);

    // Check cache first
    let segment = cacheRef.current.get(segmentIndex);
    
    if (segment) {
      cacheRef.current.delete(segmentIndex);
    } else {
      setIsLoading(true);
      const fetched = await fetchSegment(segmentIndex);
      if (fetched) {
        segment = { ...fetched, index: segmentIndex };
      }
    }
    
    if (!segment || !isActiveRef.current) {
      isProcessingRef.current = false;
      setIsLoading(false);
      return;
    }

    setCurrentText(segment.text);
    setIsLoading(false);

    // Start prefetching next segment immediately
    prefetchSegment(segmentIndex + 1);

    // Create and play audio
    if (audioRef.current) {
      audioRef.current.pause();
      URL.revokeObjectURL(audioRef.current.src);
    }

    const audio = new Audio(segment.audioUrl);
    audioRef.current = audio;
    audio.muted = isMuted;
    audio.volume = volume;

    audio.onplay = () => {
      setIsPlaying(true);
    };
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
    } catch {
      setError('Click to start broadcast');
      isProcessingRef.current = false;
    }
  }, [segmentIndex, fetchSegment, isMuted, volume, prefetchSegment]);

  // Mount/unmount lifecycle
  useEffect(() => {
    // Reset to active on mount (handles React Strict Mode double-mount)
    isActiveRef.current = true;
    
    // Capture refs for cleanup
    const cache = cacheRef.current;
    const audio = audioRef.current;
    
    // Auto-start playback on mount if autoPlay is enabled
    if (autoPlay) {
      playNextSegment();
    }
    
    return () => {
      isActiveRef.current = false;
      if (audio) {
        audio.pause();
        URL.revokeObjectURL(audio.src);
      }
      // Clear cache on unmount
      cache.forEach(segment => URL.revokeObjectURL(segment.audioUrl));
      cache.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount/unmount

  // Continue playing next segment when current one ends
  useEffect(() => {
    // Skip initial mount (handled above) - only trigger on segment changes
    if (segmentIndex > 0 && autoPlay && isActiveRef.current) {
      playNextSegment();
    }
  }, [segmentIndex, autoPlay, playNextSegment]);

  const play = useCallback(() => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().catch(() => {});
    } else if (!isProcessingRef.current) {
      playNextSegment();
    }
  }, [playNextSegment]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev;
      if (audioRef.current) {
        audioRef.current.muted = newMuted;
      }
      return newMuted;
    });
  }, []);

  const setAudioVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
  }, []);

  const stop = useCallback(() => {
    isActiveRef.current = false;
    if (audioRef.current) {
      audioRef.current.pause();
      URL.revokeObjectURL(audioRef.current.src);
      audioRef.current = null;
    }
    // Clear cache
    cacheRef.current.forEach(segment => URL.revokeObjectURL(segment.audioUrl));
    cacheRef.current.clear();
    prefetchingRef.current.clear();
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
    isMuted,
    volume,
    play,
    pause,
    stop,
    restart,
    toggleMute,
    setVolume: setAudioVolume,
  };
}
