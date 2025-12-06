/**
 * Polygon Drawer Component for Leaflet Map
 *
 * Allows users to manually enter coordinates and displays them on a map.
 * Calculates area from coordinates. (Simplified version without leaflet-draw)
 */

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Trash2, Edit } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface PolygonDrawerProps {
  value?: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  onChange: (polygon: { type: 'Polygon'; coordinates: number[][][] } | null) => void;
  className?: string;
}

export default function PolygonDrawer({ value, onChange, className }: PolygonDrawerProps) {
  const [coordinatesText, setCoordinatesText] = useState('');
  const [polygon, setPolygon] = useState<L.LatLng[] | null>(null);
  const [area, setArea] = useState<number>(0);
  const [coordinates, setCoordinates] = useState<number[][]>([]);

  // Convert GeoJSON to coordinate text
  useEffect(() => {
    if (value?.coordinates?.[0]) {
      const coords = value.coordinates[0];
      const textCoords = coords.map(([lng, lat]) => `${lat.toFixed(6)},${lng.toFixed(6)}`).join('; ');
      setCoordinatesText(textCoords);
      setCoordinates(coords);
      convertAndDisplayPolygon(coords);
      calculateArea(coords);
    }
  }, [value]);

  const parseCoordinates = (coordText: string): number[][] => {
    try {
      // Skip if input is empty or only whitespace
      if (!coordText || coordText.trim() === '') {
        return [];
      }

      // Expected format: "lat1,lng1; lat2,lng2; lat3,lng3; lat4,lng4"
      const points = coordText
        .split(';')
        .map(point => point.trim())
        .filter(point => point.length > 0)
        .map(point => {
          const parts = point.split(',').map(p => p.trim());
          if (parts.length !== 2) throw new Error('Invalid coordinate format');

          const [latStr, lngStr] = parts;
          const lat = parseFloat(latStr);
          const lng = parseFloat(lngStr);

          if (isNaN(lat) || isNaN(lng)) throw new Error('Invalid coordinate format');
          if (lat < -90 || lat > 90) throw new Error('Latitude must be between -90 and 90');
          if (lng < -180 || lng > 180) throw new Error('Longitude must be between -180 and 180');

          return [lng, lat]; // GeoJSON uses [lng, lat]
        })
        .filter(point => point.every(coord => !isNaN(coord)));

      if (points.length < 3) {
        return []; // Return empty array instead of throwing for validation
      }

      // Close the polygon if not already closed
      const first = points[0];
      const last = points[points.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) {
        points.push([...first]);
      }

      return points;
    } catch (error) {
      console.error('Coordinate parsing error:', error);
      return [];
    }
  };

  const calculateArea = (coords: number[][]) => {
    if (coords.length < 4) { // Need at least 3 points + closing point
      setArea(0);
      return;
    }

    try {
      // Calculate area using shoelace formula
      let area = 0;
      for (let i = 0; i < coords.length - 1; i++) {
        const [x1, y1] = coords[i];
        const [x2, y2] = coords[i + 1];
        area += x1 * y2 - x2 * y1;
      }
      area = Math.abs(area) / 2;

      // Convert square degrees to hectares (very rough approximation)
      // More accurate would require proper geodesic calculation
      const squareDegreesToHectares = 111 * 111 * 100; // Roughly 111km per degree
      const hectares = Math.abs(area) * squareDegreesToHectares;

      setArea(hectares);
    } catch (error) {
      console.error('Area calculation error:', error);
      setArea(0);
    }
  };

  const convertAndDisplayPolygon = (coords: number[][]) => {
    if (coords.length >= 3) {
      const latLngs: L.LatLng[] = coords.map(([lng, lat]) => L.latLng(lat, lng));
      setPolygon(latLngs);
    } else {
      setPolygon(null);
    }
  };

  const handleCoordinatesChange = (text: string) => {
    setCoordinatesText(text);
    const coords = parseCoordinates(text);
    setCoordinates(coords);
    convertAndDisplayPolygon(coords);
    calculateArea(coords);

    if (coords.length >= 3) {
      onChange({
        type: 'Polygon',
        coordinates: [coords],
      });
    } else {
      onChange(null);
    }
  };

  const clearPolygon = () => {
    setCoordinatesText('');
    setPolygon(null);
    setArea(0);
    setCoordinates([]);
    onChange(null);
  };

  return (
    <div className={`space-y-4 ${className || ''}`}>
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Land Polygon</Label>
        {(polygon || coordinatesText) && (
          <Button variant="outline" size="sm" onClick={clearPolygon}>
            <Trash2 className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="coordinates" className="text-sm font-medium">
                Coordinates *
              </Label>
              <Textarea
                id="coordinates"
                placeholder="Enter coordinates as: latitude,longitude; latitude,longitude; ..."
                value={coordinatesText}
                onChange={(e) => handleCoordinatesChange(e.target.value)}
                rows={4}
              />
              <div className="text-xs text-muted-foreground">
                Example: 12.9716,77.5946; 12.9717,77.5947; 12.9718,77.5946; 12.9717,77.5945
              </div>
            </div>

            <div className="h-96 rounded-lg overflow-hidden border">
              <MapContainer
                center={polygon ? [polygon[0].lat, polygon[0].lng] : [20, 0]}
                zoom={polygon ? 15 : 3}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {polygon && <Polygon positions={polygon} color="blue" fillOpacity={0.2} />}
              </MapContainer>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>
                  {coordinates.length > 0 ? `${coordinates.length - 1} points` : 'No coordinates entered'}
                </span>
              </div>

              {area > 0 && (
                <div className="text-green-600 font-medium">
                  Area: {area.toFixed(2)} hectares ({(area * 2.471).toFixed(2)} acres)
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground">
        <div className="flex items-start gap-2">
          <Edit className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <div>
            <strong>How to use:</strong> Enter coordinates in "latitude,longitude" format, separated by semicolons.
            The polygon will automatically close and display on the map. Minimum 3 points required.
          </div>
        </div>
      </div>
    </div>
  );
}
