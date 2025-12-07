import React from 'react';
import dynamic from 'next/dynamic';

const SatelliteMapClient = dynamic(
  () =>
    // @ts-ignore - Dynamic import resolution issue with Next.js
    import('./SatelliteMapClient'),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <div className="text-sm text-gray-500">Loading satellite map...</div>
      </div>
    ),
  }
);

interface SatelliteMapProps {
  onPolygonComplete?: (geoJson: any) => void;
  className?: string;
}

export default function SatelliteMap({ onPolygonComplete, className }: SatelliteMapProps) {
  return (
    <div className={`h-full w-full ${className || ''}`}>
      {/* @ts-ignore - Dynamic component props not inferred by TypeScript */}
      <SatelliteMapClient onPolygonComplete={onPolygonComplete} />
    </div>
  );
}
