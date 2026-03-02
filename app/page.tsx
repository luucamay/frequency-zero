'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mistral } from '@mistralai/mistralai';
import { Hero } from '@/components/Hero';
import { StationGrid } from '@/components/StationGrid';
import { StationDetail } from '@/components/StationDetail';

export type Station = {
  id: string;
  lore: string;
  agentName: string;
  imageUrl: string;
  stability: number;
  timeLeft: number;
  status: 'active' | 'static';
};

export default function Home() {
  const [stations, setStations] = useState<Station[]>([]);
  const [activeStation, setActiveStation] = useState<Station | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');

  // Timer effect for stations
  useEffect(() => {
    if (stations.length === 0) return;

    const interval = setInterval(() => {
      setStations((prev) =>
        prev.map((station) => {
          if (station.status === 'static') return station;
          
          const newTimeLeft = Math.max(0, station.timeLeft - 1);
          const newStability = (newTimeLeft / 300) * 100; // Assuming 5 mins (300s) max
          
          return {
            ...station,
            timeLeft: newTimeLeft,
            stability: newStability,
            status: newTimeLeft === 0 ? 'static' : 'active',
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [stations.length]);

  // Update active station if it changes in the main list
  useEffect(() => {
    if (activeStation) {
      const updated = stations.find(s => s.id === activeStation.id);
      if (updated) {
        setActiveStation(updated);
      }
    }
  }, [stations, activeStation, activeStation?.id]);

  const handleGenerate = async (lore: string, imageSize: string, aspectRatio: string) => {
    if (!lore.trim()) return;
    
    // Check for API key
    // @ts-ignore
    if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
    }

    setIsGenerating(true);
    setGenerationStatus('Intercepting signals...');
    
    try {
      const client = new Mistral({ apiKey: process.env.NEXT_PUBLIC_MISTRAL_API_KEY });
      
      // 1. Generate Station Concepts
      setGenerationStatus('Decrypting agent identities...');
      const conceptResponse = await client.chat.complete({
        model: 'ministral-3b-latest',
        responseFormat: { type: 'json_object' },
        messages: [{
          role: 'user',
          content: `Generate 4 distinct AI whistleblower personas based on this lore: "${lore}". They are broadcasting synthetic truths from the edges of the web.

Respond with a JSON object containing a "personas" array where each item has:
- agentName: A cryptic, hacker-style name for the agent
- visualPrompt: A detailed prompt to generate a profile image of this agent. Must be dark, gritty, cyberpunk, or glitch-art style
- shortLore: A 1-sentence summary of what they are broadcasting`
        }]
      });

      const rawContent = conceptResponse.choices?.[0]?.message?.content;
      const responseText = typeof rawContent === 'string' 
        ? rawContent 
        : Array.isArray(rawContent) 
          ? rawContent.map(chunk => 'text' in chunk ? chunk.text : '').join('')
          : '{"personas": []}';
      
      // Extract JSON from potential markdown code blocks or extra text
      let jsonText = responseText;
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/) || 
                        responseText.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        jsonText = jsonMatch[1].trim();
      }
      
      let parsed;
      try {
        parsed = JSON.parse(jsonText);
      } catch {
        console.error('Failed to parse JSON:', jsonText);
        parsed = { personas: [] };
      }
      const concepts = parsed.personas || [];
      
      // 2. Create stations with placeholder images
      setGenerationStatus('Establishing visual feeds...');
      const newStations: Station[] = [];

      for (let i = 0; i < Math.min(4, concepts.length); i++) {
        const concept = concepts[i];
        const imageUrl = `https://picsum.photos/seed/${concept.agentName.replace(/\s+/g, '')}/400/600`;

        newStations.push({
          id: `station-${Date.now()}-${i}`,
          lore: concept.shortLore,
          agentName: concept.agentName,
          imageUrl,
          stability: 100,
          timeLeft: 292, // 04:52 as requested
          status: 'active'
        });
      }

      setStations(newStations);
      setGenerationStatus('');
    } catch (error) {
      console.error("Generation failed:", error);
      setGenerationStatus('Signal lost. Try again.');
      setTimeout(() => setGenerationStatus(''), 3000);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFuel = (id: string) => {
    setStations(prev => prev.map(s => {
      if (s.id === id) {
        const newTime = Math.min(s.timeLeft + 300, 300); // Add 5 mins, cap at 5 mins
        return { ...s, timeLeft: newTime, stability: (newTime / 300) * 100, status: 'active' };
      }
      return s;
    }));
    // Play sound effect here in a real app
    const audio = new Audio('data:audio/mp3;base64,//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq'); // Dummy audio
    audio.play().catch(() => {});
  };

  const handleInject = (id: string, message: string) => {
    // In a real app, this would send a message to the agent's backend
    console.log(`Injected message to ${id}: ${message}`);
  };

  return (
    <main className="min-h-screen w-full flex flex-col relative">
      <AnimatePresence mode="wait">
        {stations.length === 0 ? (
          <motion.div 
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -50 }}
            className="flex-1 flex flex-col"
          >
            <Hero onGenerate={handleGenerate} isGenerating={isGenerating} status={generationStatus} />
          </motion.div>
        ) : (
          <motion.div 
            key="grid"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col p-4 md:p-8 max-w-7xl mx-auto w-full"
          >
            <div className="flex justify-between items-center mb-8">
              <h1 className="font-mono text-2xl font-bold tracking-widest text-red-500 glitch-text" data-text="[ FREQUENCY ZERO ]">
                [ FREQUENCY ZERO ]
              </h1>
              <button 
                onClick={() => setStations([])}
                className="text-xs font-mono text-zinc-400 hover:text-zinc-100 uppercase tracking-widest border border-zinc-800 px-3 py-1 rounded-sm"
              >
                Retune
              </button>
            </div>
            <StationGrid stations={stations} onSelect={setActiveStation} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeStation && (
          <StationDetail 
            station={activeStation} 
            onClose={() => setActiveStation(null)} 
            onFuel={() => handleFuel(activeStation.id)}
            onInject={(msg) => handleInject(activeStation.id, msg)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
