'use client';

import { useState, useEffect } from 'react';
import { StationDetail } from '@/components/StationDetail';
import { Station } from '@/app/page';

const initialStations: Station[] = [
  {
    id: '1',
    agentName: 'ECHO-7',
    lore: 'A rogue AI broadcasting cryptic messages from an abandoned radio tower. Its origins remain unknown.',
    imageUrl: 'https://picsum.photos/seed/station1/800/600',
    stability: 75,
    timeLeft: 180,
    status: 'active',
  },
  {
    id: '2',
    agentName: 'STATIC PROPHET',
    lore: 'Claims to predict the future through white noise patterns. Followers swear by its accuracy.',
    imageUrl: 'https://picsum.photos/seed/station2/800/600',
    stability: 45,
    timeLeft: 90,
    status: 'active',
  },
  {
    id: '3',
    agentName: 'DEAD SIGNAL',
    lore: 'This frequency went silent months ago. Some say it still transmits on full moons.',
    imageUrl: 'https://picsum.photos/seed/station3/800/600',
    stability: 0,
    timeLeft: 0,
    status: 'static',
  },
];

export default function TestStationDetailPage() {
  const [stations, setStations] = useState<Station[]>(initialStations);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  // Timer effect - decrease timeLeft every second
  useEffect(() => {
    const interval = setInterval(() => {
      setStations(prev => prev.map(station => {
        if (station.status === 'static') return station;
        
        const newTimeLeft = Math.max(0, station.timeLeft - 1);
        const newStability = (newTimeLeft / 300) * 100;
        
        return {
          ...station,
          timeLeft: newTimeLeft,
          stability: newStability,
          status: newTimeLeft === 0 ? 'static' : 'active',
        };
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Get current station data from stations array
  const currentStation = selectedStation 
    ? stations.find(s => s.id === selectedStation.id) || null
    : null;

  const handleFuel = () => {
    if (!currentStation) return;
    
    setStations(prev => prev.map(s => {
      if (s.id === currentStation.id) {
        const newTime = s.timeLeft + 300; // Add 5 mins (cumulative, no cap)
        return { 
          ...s, 
          timeLeft: newTime, 
          stability: Math.min((newTime / 300) * 100, 100), 
          status: 'active' as const
        };
      }
      return s;
    }));
    
    console.log('✅ FUEL: Added 5 minutes to', currentStation.agentName);
  };

  const handleInject = (message: string) => {
    if (!currentStation) return;
    console.log('💉 INJECT:', message, 'to', currentStation.agentName);
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <h1 className="text-2xl font-mono text-zinc-100 mb-2">Station Detail Test</h1>
      <p className="text-zinc-500 text-sm mb-8">Click a station to open its detail view and test the payment flow.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stations.map((station) => (
          <button
            key={station.id}
            onClick={() => setSelectedStation(station)}
            className="p-6 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-left transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-2 h-2 rounded-full ${station.status === 'active' ? 'bg-red-500 animate-pulse' : 'bg-zinc-600'}`} />
              <span className="font-mono text-xs text-zinc-500 uppercase">
                {station.status === 'active' ? 'LIVE' : 'STATIC'}
              </span>
            </div>
            <h2 className="font-mono text-lg font-bold text-zinc-100 uppercase tracking-tight mb-2">
              {station.agentName}
            </h2>
            <p className="text-zinc-500 text-sm line-clamp-2">{station.lore}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-zinc-600 font-mono">
                Stability: {Math.round(station.stability)}%
              </span>
              <span className="text-xs text-zinc-600 font-mono">
                {Math.floor(station.timeLeft / 60)}:{(station.timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </button>
        ))}
      </div>

      {currentStation && (
        <StationDetail
          station={currentStation}
          onClose={() => setSelectedStation(null)}
          onFuel={handleFuel}
          onInject={handleInject}
        />
      )}
    </div>
  );
}
