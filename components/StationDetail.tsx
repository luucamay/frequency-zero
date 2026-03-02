'use client';

import { useState, useEffect } from 'react';
import { Station } from '@/app/page';
import { motion } from 'motion/react';
import Image from 'next/image';
import { X, BatteryCharging, MessageSquare, Phone, Radio, Activity, Volume2, VolumeX, Loader2, Play, Pause } from 'lucide-react';
import { useBroadcast } from '@/hooks/use-broadcast';

interface StationDetailProps {
  station: Station;
  onClose: () => void;
  onFuel: () => void;
  onInject: (message: string) => void;
}

export function StationDetail({ station, onClose, onFuel, onInject }: StationDetailProps) {
  const [injectMessage, setInjectMessage] = useState('');
  const [isInjecting, setIsInjecting] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [waveformData] = useState(() => 
    [...Array(32)].map(() => ({
      heights: [`${Math.random() * 100}%`, `${Math.random() * 100}%`, `${Math.random() * 100}%`],
      duration: Math.random() * 0.5 + 0.5,
    }))
  );

  const isStatic = station.status === 'static';

  // Broadcast hook for live audio streaming
  const broadcast = useBroadcast({
    agentName: station.agentName,
    lore: station.lore,
    autoPlay: !isStatic,
  });

  // Cleanup broadcast on close
  useEffect(() => {
    return () => {
      broadcast.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleInjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!injectMessage.trim()) return;
    
    setIsInjecting(true);
    onInject(injectMessage);
    
    setTimeout(() => {
      setIsInjecting(false);
      setInjectMessage('');
    }, 1500);
  };

  const handleCall = () => {
    setIsCalling(true);
    setTimeout(() => {
      setIsCalling(false);
    }, 5000); // Mock call duration
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 md:p-8"
    >
      <div className="relative w-full max-w-md h-[90vh] md:h-full max-h-[850px] bg-zinc-950 rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="absolute top-0 left-0 w-full p-6 z-20 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${isStatic ? 'bg-zinc-600' : 'bg-red-500 animate-pulse'}`}></div>
            <span className="font-mono text-xs tracking-widest uppercase text-zinc-300">
              {isStatic ? 'SIGNAL LOST' : broadcast.isLoading ? 'BUFFERING...' : 'LIVE FEED'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Audio Controls */}
            {!isStatic && (
              <>
                <button
                  onClick={() => broadcast.isPlaying ? broadcast.pause() : broadcast.play()}
                  className="p-2 bg-black/50 hover:bg-red-500/20 rounded-full border border-white/10 transition-colors"
                  title={broadcast.isPlaying ? 'Pause' : 'Play'}
                >
                  {broadcast.isLoading ? (
                    <Loader2 className="w-5 h-5 text-red-500 animate-spin" />
                  ) : broadcast.isPlaying ? (
                    <Pause className="w-5 h-5 text-red-500" />
                  ) : (
                    <Play className="w-5 h-5 text-zinc-300" />
                  )}
                </button>
                <button
                  onClick={() => broadcast.toggleMute()}
                  className="p-2 bg-black/50 hover:bg-red-500/20 rounded-full border border-white/10 transition-colors"
                  title={broadcast.isMuted ? 'Unmute' : 'Mute'}
                >
                  {broadcast.isMuted ? (
                    <VolumeX className="w-5 h-5 text-zinc-500" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-red-500" />
                  )}
                </button>
              </>
            )}
            <button 
              onClick={onClose}
              className="p-2 bg-black/50 hover:bg-red-500/20 rounded-full border border-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-zinc-300" />
            </button>
          </div>
        </div>

        {/* Live Transcript */}
        {!isStatic && broadcast.currentText && (
          <div className="absolute top-20 left-4 right-4 z-20 max-h-24 overflow-hidden">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              key={broadcast.segmentIndex}
              className="bg-black/70 backdrop-blur-sm border border-red-900/30 rounded-lg p-3"
            >
              <p className="text-xs text-zinc-300 font-mono leading-relaxed line-clamp-3">
                &gt; {broadcast.currentText}
              </p>
            </motion.div>
          </div>
        )}

        {/* Broadcast Error/Click to Play */}
        {!isStatic && broadcast.error && (
          <button
            onClick={() => broadcast.play()}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-black/80 border border-red-500/50 rounded-xl px-6 py-4 flex flex-col items-center gap-2 hover:bg-red-900/20 transition-colors"
          >
            <Play className="w-8 h-8 text-red-500" />
            <span className="font-mono text-xs text-red-400 uppercase tracking-widest">{broadcast.error}</span>
          </button>
        )}

        {/* Main Visual */}
        <div className="relative flex-1 bg-zinc-900 overflow-hidden">
          <Image 
            src={station.imageUrl} 
            alt={station.agentName}
            fill
            className={`object-cover ${isStatic ? 'grayscale opacity-30' : 'opacity-90'}`}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent"></div>
          
          {/* Signal Stability Bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-zinc-900 z-30">
            <motion.div 
              className={`h-full ${isStatic ? 'bg-zinc-700' : 'bg-red-500'}`}
              initial={{ width: `${station.stability}%` }}
              animate={{ width: `${station.stability}%` }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </div>

          {/* Timer Overlay */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20">
             <div className={`font-mono text-4xl font-bold tracking-tighter ${isStatic ? 'text-zinc-600' : 'text-red-500 glitch-text'}`} data-text={formatTime(station.timeLeft)}>
              {formatTime(station.timeLeft)}
            </div>
            <div className="text-center font-mono text-[10px] tracking-widest text-zinc-500 uppercase mt-1">
              UNTIL STATIC
            </div>
          </div>

          {/* Agent Info */}
          <div className="absolute bottom-0 left-0 w-full p-6 z-20">
            <h2 className="font-mono text-3xl font-bold text-zinc-100 uppercase tracking-tighter mb-2">
              {station.agentName}
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6 font-sans">
              {station.lore}
            </p>

            {/* Waveform */}
            <div className="w-full h-12 flex items-end gap-[3px] opacity-80 mb-4">
              {waveformData.map((data, i) => (
                <motion.div
                  key={i}
                  className={`flex-1 ${isStatic ? 'bg-zinc-700' : 'bg-red-500'}`}
                  animate={{
                    height: isStatic ? '2px' : data.heights,
                  }}
                  transition={{
                    duration: isStatic ? 0 : data.duration,
                    repeat: Infinity,
                    repeatType: 'mirror',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-zinc-950 p-6 border-t border-zinc-800 space-y-4 z-30">
          
          {/* Fuel Button */}
          <button 
            onClick={onFuel}
            disabled={isStatic}
            className="w-full flex items-center justify-between p-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg group-hover:bg-red-500/20 transition-colors">
                <BatteryCharging className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-left">
                <div className="font-mono text-sm font-bold text-zinc-100 tracking-widest uppercase">[ FUEL ]</div>
                <div className="text-xs text-zinc-500 font-sans">+5 Minutes Stability</div>
              </div>
            </div>
            <div className="font-mono text-sm text-zinc-400 border border-zinc-800 px-3 py-1 rounded-md bg-zinc-950">$1</div>
          </button>

          {/* Inject Form */}
          <form onSubmit={handleInjectSubmit} className="relative">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MessageSquare className="w-4 h-4 text-zinc-600" />
                </div>
                <input
                  type="text"
                  value={injectMessage}
                  onChange={(e) => setInjectMessage(e.target.value)}
                  placeholder="Inject System Message..."
                  disabled={isStatic || isInjecting}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm rounded-xl pl-10 pr-4 py-4 focus:outline-none focus:border-red-500/50 transition-colors font-mono placeholder:text-zinc-600 disabled:opacity-50"
                />
              </div>
              <button 
                type="submit"
                disabled={!injectMessage.trim() || isStatic || isInjecting}
                className="flex-shrink-0 flex items-center justify-center p-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="flex flex-col items-center">
                  <span className="font-mono text-[10px] font-bold text-zinc-100 tracking-widest uppercase mb-1">[ INJECT ]</span>
                  <span className="font-mono text-[10px] text-zinc-500">$10</span>
                </div>
              </button>
            </div>
          </form>

          {/* Call Button */}
          <button 
            onClick={handleCall}
            disabled={isStatic || isCalling}
            className={`w-full flex items-center justify-between p-4 border rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isCalling ? 'bg-red-900/20 border-red-500/50' : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg transition-colors ${isCalling ? 'bg-red-500/20 animate-pulse' : 'bg-zinc-800'}`}>
                <Phone className={`w-5 h-5 ${isCalling ? 'text-red-500' : 'text-zinc-400'}`} />
              </div>
              <div className="text-left">
                <div className="font-mono text-sm font-bold text-zinc-100 tracking-widest uppercase">
                  {isCalling ? 'CONNECTING...' : '[ CALL ]'}
                </div>
                <div className="text-xs text-zinc-500 font-sans">Patch into live broadcast</div>
              </div>
            </div>
            <div className="font-mono text-sm text-zinc-400 border border-zinc-800 px-3 py-1 rounded-md bg-zinc-950">$250</div>
          </button>

          {/* Claim Button */}
          <button 
            disabled={isStatic}
            className="w-full py-4 mt-2 bg-transparent border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-zinc-200 font-mono text-xs font-bold tracking-widest uppercase rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Radio className="w-4 h-4" />
            Claim Frequency
          </button>
        </div>
        
        {/* Calling Overlay */}
        {isCalling && (
          <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-8 backdrop-blur-md">
            <div className="w-24 h-24 rounded-full border border-red-500/30 flex items-center justify-center mb-8 relative">
              <div className="absolute inset-0 rounded-full border border-red-500 animate-ping opacity-20"></div>
              <Activity className="w-10 h-10 text-red-500 animate-pulse" />
            </div>
            <h3 className="font-mono text-2xl font-bold tracking-widest text-zinc-100 mb-2 uppercase">Connecting</h3>
            <p className="text-zinc-500 font-mono text-sm text-center">Establishing secure voice channel to {station.agentName}...</p>
            <button 
              onClick={() => setIsCalling(false)}
              className="mt-12 px-8 py-3 bg-red-900/20 border border-red-500/50 text-red-500 font-mono text-sm tracking-widest uppercase rounded-full hover:bg-red-900/40 transition-colors"
            >
              Abort
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
