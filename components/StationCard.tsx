'use client';

import { useState, useEffect } from 'react';
import { Station } from '@/app/page';
import { motion } from 'motion/react';
import Image from 'next/image';
import { Activity } from 'lucide-react';

interface StationCardProps {
  station: Station;
  onClick: () => void;
}

export function StationCard({ station, onClick }: StationCardProps) {
  const [waveformData] = useState(() => 
    [...Array(24)].map(() => ({
      heights: [`${Math.random() * 100}%`, `${Math.random() * 100}%`, `${Math.random() * 100}%`],
      duration: Math.random() * 0.5 + 0.5,
    }))
  );

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const isStatic = station.status === 'static';

  return (
    <div 
      onClick={onClick}
      className={`relative w-full aspect-[9/16] rounded-xl overflow-hidden cursor-pointer group border ${isStatic ? 'border-zinc-800' : 'border-red-900/30 hover:border-red-500/50'} transition-colors duration-500`}
    >
      {/* Background Image */}
      <div className="absolute inset-0 bg-zinc-900">
        <Image 
          src={station.imageUrl} 
          alt={station.agentName}
          fill
          className={`object-cover transition-transform duration-700 group-hover:scale-105 ${isStatic ? 'grayscale opacity-30' : 'opacity-80'}`}
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
      </div>

      {/* Stability Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-zinc-900">
        <motion.div 
          className={`h-full ${isStatic ? 'bg-zinc-700' : 'bg-red-500'}`}
          initial={{ width: '100%' }}
          animate={{ width: `${station.stability}%` }}
          transition={{ duration: 1, ease: 'linear' }}
        />
      </div>

      {/* Top Overlay */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-2 py-1 rounded border border-white/10">
          <Activity className={`w-3 h-3 ${isStatic ? 'text-zinc-500' : 'text-red-500 animate-pulse'}`} />
          <span className="font-mono text-[10px] tracking-widest uppercase text-zinc-300">
            {isStatic ? 'OFFLINE' : 'LIVE'}
          </span>
        </div>
        <div className={`font-mono text-xs tracking-widest bg-black/50 backdrop-blur-md px-2 py-1 rounded border border-white/10 ${isStatic ? 'text-zinc-500' : 'text-red-400'}`}>
          {formatTime(station.timeLeft)}
        </div>
      </div>

      {/* Bottom Overlay */}
      <div className="absolute bottom-0 left-0 w-full p-4 z-10 bg-gradient-to-t from-black via-black/80 to-transparent pt-12">
        <h3 className="font-mono font-bold text-lg text-zinc-100 uppercase tracking-wider mb-1 truncate">
          {station.agentName}
        </h3>
        <p className="text-zinc-400 text-xs line-clamp-2 leading-relaxed">
          {station.lore}
        </p>
        
        {/* Waveform (SVG) */}
        <div className="w-full h-8 mt-4 flex items-end gap-[2px] opacity-70">
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
      
      {/* Glitch Overlay on Hover */}
      {!isStatic && (
        <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 mix-blend-overlay transition-opacity duration-300 pointer-events-none"></div>
      )}
    </div>
  );
}
