/**
 * Example Usage of SatelliteMap Component
 *
 * This shows how to integrate the SatelliteMap component into a claim creation form.
 * The SatelliteMap component provides:
 * - Interactive polygon drawing on satellite imagery
 * - SSR-safe dynamic imports
 * - GeoJSON data output
 * - Green (#16a34a) outline styling for polygons
 */

import React from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Dynamically import SatelliteMap with SSR disabled
const SatelliteMap = dynamic(
  () => import('./SatelliteMap').then(mod => ({ default: mod.default })),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Loading satellite map...</div>
      </div>
    ),
  }
);

interface SatelliteMapExampleProps {
  onPolygonComplete: (geoJson: any) => void;
  className?: string;
}

export default function SatelliteMapExample({ onPolygonComplete, className }: SatelliteMapExampleProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Land Boundary Selection</CardTitle>
        <CardDescription>
          Use the polygon drawing tool to define the boundaries of your land on the satellite map.
          Click on the map to start drawing and double-click to complete the polygon.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Instructions */}
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
            <div className="flex items-start gap-2">
              <div className="text-blue-600 font-medium">Instructions:</div>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Search:</strong> Use the search box in the top-left to find cities, towns, or landmarks</p>
                <p><strong>Navigate:</strong> Scroll to zoom, drag to pan, or use zoom controls</p>
                <p><strong>Draw:</strong> Click the polygon tool (square with pencil icon) then:</p>
                <div className="ml-4">
                  <p>1. Click on the map to place points defining your boundary</p>
                  <p>2. Double-click or click the first point to complete the polygon</p>
                  <p>3. The green outline shows your selected area</p>
                </div>
              </div>
            </div>
          </div>

          {/* Satellite Map Component */}
          <div className="h-96 border rounded-lg overflow-hidden">
            <SatelliteMap
              onPolygonComplete={onPolygonComplete}
              className="h-full"
            />
          </div>

          {/* Additional Notes */}
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Note:</strong> Only polygon drawing is enabled. You can delete and redraw as needed.</p>
            <p>The map uses satellite imagery from Esri for accurate land visualization.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
