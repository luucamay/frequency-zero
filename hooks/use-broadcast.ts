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
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isActiveRef = useRef(true);
  const audioQueueRef = useRef<string[]>([]);
  const isProcessingRef = useRef(false);

  const fetchSegment = useCallback(async (index: number): Promise<{ audioUrl: string; text: string } | null> => {
    console.log('[BROADCAST] fetchSegment called, index:', index);
    try {
      const response = await fetch('/api/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentName, lore, segmentIndex: index }),
      });

      console.log('[BROADCAST] API response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Broadcast request failed');
      }

      const audioBlob = await response.blob();
      console.log('[BROADCAST] Audio blob size:', audioBlob.size);
      const audioUrl = URL.createObjectURL(audioBlob);
      const text = decodeURIComponent(response.headers.get('X-Broadcast-Text') || '');
      
      return { audioUrl, text };
    } catch (err) {
      console.error('[BROADCAST] Failed to fetch segment:', err);
      return null;
    }
  }, [agentName, lore]);

  const playNextSegment = useCallback(async () => {
    console.log('[BROADCAST] playNextSegment called, isActive:', isActiveRef.current, 'isProcessing:', isProcessingRef.current);
    
    if (!isActiveRef.current || isProcessingRef.current) {
      console.log('[BROADCAST] Skipping - already processing or inactive');
      return;
    }
    
    isProcessingRef.current = true;
    setIsLoading(true);
    setError(null);

    console.log('[BROADCAST] Fetching segment', segmentIndex);
    const segment = await fetchSegment(segmentIndex);
    
    if (!segment || !isActiveRef.current) {
      console.log('[BROADCAST] No segment or inactive, bailing out');
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
    audio.muted = isMuted;
    audio.volume = volume;

    console.log('[BROADCAST] Audio created, muted:', isMuted, 'volume:', volume);
    audio.onplay = () => {
      console.log('[BROADCAST] Audio started playing');
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
      console.log('[BROADCAST] Attempting to play audio...');
      await audio.play();
      console.log('[BROADCAST] Audio play() succeeded');
    } catch (err) {
      console.error('[BROADCAST] Playback error:', err);
      setError('Click to start broadcast');
      isProcessingRef.current = false;
    }
  }, [segmentIndex, fetchSegment, isMuted, volume]);

  // Mount/unmount lifecycle
  useEffect(() => {
    // Reset to active on mount (handles React Strict Mode double-mount)
    isActiveRef.current = true;
    console.log('[BROADCAST] Mount effect - setting isActive to true, autoPlay:', autoPlay);
    
    // Auto-start playback on mount if autoPlay is enabled
    if (autoPlay) {
      console.log('[BROADCAST] Starting autoplay on mount');
      playNextSegment();
    }
    
    return () => {
      console.log('[BROADCAST] Cleanup effect - setting isActive to false');
      isActiveRef.current = false;
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount/unmount

  // Continue playing next segment when current one ends
  useEffect(() => {
    // Skip initial mount (handled above) - only trigger on segment changes
    if (segmentIndex > 0 && autoPlay && isActiveRef.current) {
      console.log('[BROADCAST] Segment changed to', segmentIndex, '- playing next');
      playNextSegment();
    }
  }, [segmentIndex, autoPlay, playNextSegment]);

  const play = useCallback(() => {
    console.log('[BROADCAST] play() called, audioRef:', !!audioRef.current, 'paused:', audioRef.current?.paused, 'isProcessing:', isProcessingRef.current);
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

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev;
      if (audioRef.current) {
        audioRef.current.muted = newMuted;
      }
      console.log('[BROADCAST] Mute toggled:', newMuted);
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
