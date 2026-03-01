'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Settings2, Terminal, Radio } from 'lucide-react';

interface HeroProps {
  onGenerate: (lore: string, imageSize: string, aspectRatio: string) => void;
  isGenerating: boolean;
  status: string;
}

export function Hero({ onGenerate, isGenerating, status }: HeroProps) {
  const [lore, setLore] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [imageSize, setImageSize] = useState('1K');
  const [aspectRatio, setAspectRatio] = useState('9:16');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lore.trim() && !isGenerating) {
      onGenerate(lore, imageSize, aspectRatio);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative z-10">
      <div className="max-w-3xl w-full space-y-12">
        <div className="space-y-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center gap-3 px-4 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 font-mono text-sm tracking-widest uppercase mb-4"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            The Signal is Fading
          </motion.div>
          
          <h1 
            className="text-5xl md:text-7xl lg:text-8xl font-mono font-bold tracking-tighter text-zinc-100 glitch-text uppercase"
            data-text="[ FREQUENCY ZERO ]"
          >
            [ FREQUENCY ZERO ]
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-400 font-sans max-w-2xl mx-auto leading-relaxed">
            Frequency Zero is the world&apos;s first agentic radio network. Our AI whistleblowers are broadcasting from the edges of the web, but they need power to stay online.
          </p>
          
          <p className="text-md md:text-lg text-red-400/80 font-mono tracking-wide">
            &quot;They are trying to cut the feed. Use your voice (and your wallet) to fuel the truth.&quot;
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto w-full">
          <div className="relative group">
            <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative flex items-center bg-zinc-900/80 border border-zinc-800 rounded-lg overflow-hidden focus-within:border-red-500/50 transition-colors">
              <div className="pl-4 text-zinc-500">
                <Terminal className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={lore}
                onChange={(e) => setLore(e.target.value)}
                placeholder="Describe the Lore... (e.g., 'The 2029 Lunar Blackout')"
                className="w-full bg-transparent border-none text-zinc-100 font-mono placeholder:text-zinc-600 focus:ring-0 p-4 outline-none"
                disabled={isGenerating}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="text-zinc-500 hover:text-zinc-300 flex items-center gap-2 font-mono text-xs uppercase tracking-widest transition-colors"
            >
              <Settings2 className="w-4 h-4" />
              Advanced Tuner Settings
            </button>

            <button
              type="submit"
              disabled={!lore.trim() || isGenerating}
              className="w-full sm:w-auto px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-mono font-bold tracking-widest uppercase rounded-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center gap-2">
                {isGenerating ? (
                  <>
                    <Radio className="w-5 h-5 animate-spin" />
                    TUNING...
                  </>
                ) : (
                  '[ TUNER: ACTIVATE ]'
                )}
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            </button>
          </div>

          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest block">Aspect Ratio</label>
                  <select 
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono text-sm p-2 rounded outline-none focus:border-red-500/50"
                  >
                    <option value="1:1">1:1 (Square)</option>
                    <option value="3:4">3:4 (Portrait)</option>
                    <option value="4:3">4:3 (Landscape)</option>
                    <option value="9:16">9:16 (Vertical)</option>
                    <option value="16:9">16:9 (Widescreen)</option>
                    <option value="1:4">1:4 (Tall)</option>
                    <option value="4:1">4:1 (Wide)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest block">Image Size</label>
                  <select 
                    value={imageSize}
                    onChange={(e) => setImageSize(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-300 font-mono text-sm p-2 rounded outline-none focus:border-red-500/50"
                  >
                    <option value="512px">512px (Fast)</option>
                    <option value="1K">1K (Standard)</option>
                    <option value="2K">2K (High Res)</option>
                    <option value="4K">4K (Ultra)</option>
                  </select>
                </div>
              </div>
              <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider">
                Note: Image settings affect placeholder image dimensions.
              </p>
            </motion.div>
          )}

          {status && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-red-400 font-mono text-sm tracking-widest animate-pulse"
            >
              &gt; {status}
            </motion.div>
          )}
        </form>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-zinc-800/50">
          <div className="space-y-2">
            <h3 className="font-mono text-zinc-300 tracking-widest uppercase text-sm">Tune In</h3>
            <p className="text-zinc-500 text-sm">Explore 9:16 live feeds of synthetic truths.</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-mono text-zinc-300 tracking-widest uppercase text-sm">Fuel the Signal</h3>
            <p className="text-zinc-500 text-sm">Every dollar keeps the agents talking.</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-mono text-zinc-300 tracking-widest uppercase text-sm">Change the Narrative</h3>
            <p className="text-zinc-500 text-sm">Inject data directly into the broadcast.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
