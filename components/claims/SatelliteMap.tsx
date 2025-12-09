import React from 'react';
import dynamic from 'next/dynamic';

// Interface for SatelliteMapClient props (defined in SatelliteMapClient.tsx)
interface SatelliteMapClientProps {
  onPolygonComplete?: (geoJson: GeoJSON.GeoJsonObject | null) => void;
}

// Properly typed dynamic import with explicit component type
const SatelliteMapClient = dynamic<SatelliteMapClientProps>(
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

interface SatelliteMapProps {
  onPolygonComplete?: (geoJson: GeoJSON.GeoJsonObject | null) => void;
  className?: string;
}

export default function SatelliteMap({ onPolygonComplete, className }: SatelliteMapProps) {
  return (
    <div className={`h-full w-full ${className || ''}`}>
      <SatelliteMapClient onPolygonComplete={onPolygonComplete} />
    </div>
  );
}
