'use client';

import { Station } from '@/app/page';
import { StationCard } from './StationCard';
import { motion } from 'motion/react';

interface StationGridProps {
  stations: Station[];
  onSelect: (station: Station) => void;
}

export function StationGrid({ stations, onSelect }: StationGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full pb-20">
      {stations.map((station, i) => (
        <motion.div
          key={station.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="h-full"
        >
          <StationCard station={station} onClick={() => onSelect(station)} />
        </motion.div>
      ))}
    </div>
  );
}
