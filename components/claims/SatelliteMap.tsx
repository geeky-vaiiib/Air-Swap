import React from 'react';
import dynamic from 'next/dynamic';

interface SatelliteMapProps {
  onPolygonComplete?: (geoJson: any) => void;
  className?: string;
}

// Dynamically import the client-only component to avoid SSR issues
const SatelliteMapClient = dynamic(
  () => import('./SatelliteMapClient'),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <div className="text-sm text-gray-500">Loading satellite map...</div>
      </div>
    ),
  }
);

export default function SatelliteMap({ onPolygonComplete, className }: SatelliteMapProps) {
  return (
    <div className={`h-full w-full ${className || ''}`}>
      <SatelliteMapClient onPolygonComplete={onPolygonComplete} />
    </div>
  );
}
