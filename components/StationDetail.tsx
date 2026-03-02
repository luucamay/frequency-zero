'use client';

import { useState, useEffect } from 'react';
import { Station } from '@/app/page';
import { motion } from 'motion/react';
import Image from 'next/image';
import { X, BatteryCharging, MessageSquare, Phone, Radio, Volume2, VolumeX, Play, Mic, MicOff, PhoneOff } from 'lucide-react';
import { useBroadcast } from '@/hooks/use-broadcast';
import { PaymentModal, PaymentAction } from './PaymentModal';
import { useCallMode } from '@/hooks/use-call-mode';

interface StationDetailProps {
  station: Station;
  onClose: () => void;
  onFuel: () => void;
  onInject: (message: string) => void;
}

export function StationDetail({ station, onClose, onFuel, onInject }: StationDetailProps) {
  const [injectMessage, setInjectMessage] = useState('');
  const [isInjecting, setIsInjecting] = useState(false);
  const [paymentAction, setPaymentAction] = useState<PaymentAction | null>(null);
  const [pendingInjectMessage, setPendingInjectMessage] = useState('');
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

  // Call mode hook
  const callerName = typeof window !== 'undefined' 
    ? localStorage.getItem('frequency-zero-user-name') || 'Anonymous'
    : 'Anonymous';
    
  const callMode = useCallMode({
    agentName: station.agentName,
    lore: station.lore,
    callerName,
    onCallEnd: () => {
      // Resume broadcast after call ends
      if (!isStatic) {
        broadcast.play();
      }
    },
  });

  const isInCall = callMode.callState === 'active' || callMode.callState === 'requesting-permission';

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
    
    setPendingInjectMessage(injectMessage);
    setPaymentAction('inject');
  };

  const handleFuelClick = () => {
    setPaymentAction('fuel');
  };

  const handleCallClick = () => {
    setPaymentAction('call');
  };

  const handleShareClick = () => {
    const tweetText = `Tuning into ${station.agentName} on Frequency Zero 📻\n\nJoin the underground broadcast:`;
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  const handlePaymentConfirm = () => {
    if (paymentAction === 'fuel') {
      onFuel();
    } else if (paymentAction === 'inject') {
      setIsInjecting(true);
      
      // Get user name from localStorage and queue the injection
      const userName = localStorage.getItem('frequency-zero-user-name') || 'Anonymous';
      broadcast.queueInjection({ userName, content: pendingInjectMessage });
      onInject(pendingInjectMessage);
      
      setTimeout(() => {
        setIsInjecting(false);
        setInjectMessage('');
        setPendingInjectMessage('');
      }, 1500);
    } else if (paymentAction === 'call') {
      // Pause broadcast and start call mode
      broadcast.pause();
      callMode.startCall();
    }
    setPaymentAction(null);
  };

  const handlePaymentCancel = () => {
    setPaymentAction(null);
    setPendingInjectMessage('');
  };

  const formatCallTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
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
              {isStatic ? 'SIGNAL LOST' : isInCall ? 'LIVE CALL' : broadcast.isLoading ? 'BUFFERING...' : 'LIVE FEED'}
            </span>
            {isInCall && callMode.callState === 'active' && (
              <span className="ml-2 px-2 py-1 bg-red-500/20 border border-red-500/50 rounded text-[10px] font-mono text-red-400 uppercase tracking-wider animate-pulse flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {callerName} • {formatCallTime(callMode.timeLeft)}
              </span>
            )}
            {!isInCall && broadcast.pendingInjections > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-amber-500/20 border border-amber-500/50 rounded text-[10px] font-mono text-amber-400 uppercase tracking-wider animate-pulse">
                {broadcast.pendingInjections} pending
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Audio Controls */}
            {!isStatic && (
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
            )}
            <button 
              onClick={onClose}
              className="p-2 bg-black/50 hover:bg-red-500/20 rounded-full border border-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-zinc-300" />
            </button>
          </div>
        </div>

        {/* Broadcast Error/Click to Play */}
        {!isStatic && broadcast.error && !isInCall && (
          <button
            onClick={() => broadcast.play()}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-black/80 border border-red-500/50 rounded-xl px-6 py-4 flex flex-col items-center gap-2 hover:bg-red-900/20 transition-colors"
          >
            <Play className="w-8 h-8 text-red-500" />
            <span className="font-mono text-xs text-red-400 uppercase tracking-widest">{broadcast.error}</span>
          </button>
        )}

        {/* Floating Mic Button - Active Call */}
        {callMode.callState === 'active' && (
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-3">
            {/* Audio Waveform when host is speaking */}
            {callMode.isSpeaking && (
              <div className="flex items-center justify-center gap-1 h-8 mb-2">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-red-500 rounded-full"
                    animate={{
                      height: [`${15 + Math.random() * 20}px`, `${25 + Math.random() * 30}px`, `${15 + Math.random() * 20}px`]
                    }}
                    transition={{
                      duration: 0.4 + Math.random() * 0.3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: i * 0.05,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Status */}
            <button
              onClick={callMode.error ? callMode.retryPlay : undefined}
              disabled={!callMode.error}
              className={`px-4 py-2 rounded-full border transition-all ${
              callMode.isSpeaking 
                ? 'bg-red-500/20 border-red-500/50' 
                : callMode.isProcessing 
                  ? 'bg-amber-500/20 border-amber-500/50'
                  : callMode.error
                    ? 'bg-red-900/30 border-red-500/50 cursor-pointer hover:bg-red-900/50'
                    : 'bg-black/80 border-zinc-700 cursor-default'
            }`}>
              <span className={`font-mono text-xs uppercase tracking-wider ${
                callMode.isSpeaking ? 'text-red-400' : callMode.isProcessing ? 'text-amber-400' : callMode.error ? 'text-red-400' : 'text-zinc-400'
              }`}>
                {callMode.error 
                  ? '🔊 Tap to play audio'
                  : callMode.isSpeaking 
                    ? '🔊 Host Speaking...' 
                    : callMode.isProcessing 
                      ? '⏳ Processing...' 
                      : callMode.isListening 
                        ? '🎤 Speak now • Tap to send' 
                        : 'Tap mic to speak'}
              </span>
            </button>
            
            {/* Mic Button */}
            <button
              onClick={callMode.toggleListening}
              disabled={callMode.isSpeaking || callMode.isProcessing}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${
                callMode.isListening 
                  ? 'bg-red-500 animate-pulse scale-110' 
                  : callMode.isSpeaking
                    ? 'bg-red-900/50 cursor-not-allowed'
                  : callMode.isProcessing
                    ? 'bg-amber-900/50 cursor-not-allowed'
                    : 'bg-zinc-800 hover:bg-zinc-700 hover:scale-105'
              }`}
            >
              {callMode.isListening ? (
                <Mic className="w-7 h-7 text-white" />
              ) : callMode.isSpeaking ? (
                <Volume2 className="w-7 h-7 text-red-400 animate-pulse" />
              ) : (
                <MicOff className="w-7 h-7 text-zinc-400" />
              )}
            </button>

            {/* End Call Button */}
            <button
              onClick={callMode.endCall}
              className="flex items-center gap-2 px-4 py-2 bg-black/80 hover:bg-red-500/20 border border-zinc-700 rounded-full transition-colors group"
            >
              <PhoneOff className="w-3 h-3 text-red-500" />
              <span className="font-mono text-[10px] text-zinc-400 group-hover:text-red-400 tracking-widest uppercase">
                End Call
              </span>
            </button>
          </div>
        )}

        {/* Requesting Permission Overlay */}
        {callMode.callState === 'requesting-permission' && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center animate-pulse">
                <Mic className="w-8 h-8 text-red-500" />
              </div>
              <p className="font-mono text-sm text-zinc-400">Requesting microphone access...</p>
              {callMode.error && (
                <p className="font-mono text-xs text-red-400">{callMode.error}</p>
              )}
            </div>
          </div>
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

          {/* Topic Info */}
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
            onClick={handleFuelClick}
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
            onClick={handleCallClick}
            disabled={isStatic || isInCall}
            className={`w-full flex items-center justify-between p-4 border rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isInCall ? 'bg-red-900/20 border-red-500/50' : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg transition-colors ${isInCall ? 'bg-red-500/20 animate-pulse' : 'bg-zinc-800'}`}>
                <Phone className={`w-5 h-5 ${isInCall ? 'text-red-500' : 'text-zinc-400'}`} />
              </div>
              <div className="text-left">
                <div className="font-mono text-sm font-bold text-zinc-100 tracking-widest uppercase">
                  {isInCall ? 'ON AIR' : '[ CALL ]'}
                </div>
                <div className="text-xs text-zinc-500 font-sans">Patch into live broadcast</div>
              </div>
            </div>
            <div className="font-mono text-sm text-zinc-400 border border-zinc-800 px-3 py-1 rounded-md bg-zinc-950">$250</div>
          </button>

          {/* Share Button */}
          <button 
            onClick={handleShareClick}
            className="w-full py-4 mt-2 bg-transparent border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-zinc-200 font-mono text-xs font-bold tracking-widest uppercase rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Radio className="w-4 h-4" />
            Share Station
          </button>
        </div>
      </div>

      {/* Payment Modal */}
      {paymentAction && (
        <PaymentModal
          action={paymentAction}
          stationName={station.agentName}
          injectMessage={paymentAction === 'inject' ? pendingInjectMessage : undefined}
          onConfirm={handlePaymentConfirm}
          onCancel={handlePaymentCancel}
        />
      )}
    </motion.div>
  );
}
