'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { GeoSearchControl } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
import 'leaflet.locatecontrol/dist/L.Control.Locate.css';

// Custom Google Places Provider
class GooglePlacesProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async search(options: { query: string }): Promise<any[]> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(options.query)}&key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error('Google Geocoding API request failed');
      }

      const data = await response.json();

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new Error(`Google Geocoding API error: ${data.status}`);
      }

      return data.results.slice(0, 5).map((result: any) => ({
        x: result.geometry.location.lng,
        y: result.geometry.location.lat,
        label: result.formatted_address,
        bounds: result.geometry.viewport ? [
          [result.geometry.viewport.northeast.lat, result.geometry.viewport.northeast.lng],
          [result.geometry.viewport.southwest.lat, result.geometry.viewport.southwest.lng]
        ] : [
          [result.geometry.location.lat - 0.01, result.geometry.location.lng - 0.01],
          [result.geometry.location.lat + 0.01, result.geometry.location.lng + 0.01]
        ],
      }));
    } catch (error) {
      console.warn('Google Geocoding search failed:', error);
      return [];
    }
  }

  async geocode(options: { place_id: string }): Promise<any[]> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${options.place_id}&key=${this.apiKey}&fields=geometry`
      );

      if (!response.ok) {
        throw new Error('Google Places details API request failed');
      }

      const data = await response.json();

      if (data.status !== 'OK') {
        throw new Error(`Google Places details API error: ${data.status}`);
      }

      const location = data.result.geometry.location;
      return [{
        x: location.lng,
        y: location.lat,
        label: data.result.name || 'Location',
        bounds: [
          [location.lat - 0.01, location.lng - 0.01],
          [location.lat + 0.01, location.lng + 0.01]
        ]
      }];
    } catch (error) {
      console.warn('Google Places geocode failed:', error);
      return [];
    }
  }
}

// Local interface for draw events since leaflet-draw types are incomplete
interface DrawCreatedEvent extends L.LeafletEvent {
  layer: L.Layer;
  layerType: string;
}

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface SatelliteMapClientProps {
  onPolygonComplete?: (geoJson: GeoJSON.GeoJsonObject | null) => void;
}

// Constants for leaflet-draw events since types are not complete
const DRAW_EVENT_CREATED = 'draw:created';
const DRAW_EVENT_DELETED = 'draw:deleted';

function SatelliteMapContent({ onPolygonComplete }: SatelliteMapClientProps) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Create and add the Google Places search control
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
      if (apiKey) {
        const provider = new GooglePlacesProvider(apiKey);
        const searchControl = new (GeoSearchControl as any)({
          provider: provider,
          style: 'bar',
          showMarker: true,
          showPopup: false,
          marker: {
            icon: new L.Icon({
              iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            })
          },
          keepResult: false,
          autoComplete: false,
          autoCompleteDelay: 250,
        });

        map.addControl(searchControl);
      }
    } catch (error) {
      console.warn('Google Places search control failed to initialize:', error);
      // Continue without search functionality
    }

    // Add GPS locate control
    try {
      // @ts-ignore - leaflet.locatecontrol has no @types package
      import('leaflet.locatecontrol').then((LocateControlModule: any) => {
        const LocateControl = LocateControlModule.default;
        const lc = new LocateControl({
          position: 'topleft',
          strings: {
            title: "Show me where I am"
          },
          flyTo: true,
          keepCurrentZoomLevel: false,
        });
        map.addControl(lc);
      });
    } catch (error) {
      console.warn('Locate control failed to initialize:', error);
      // Continue without locate functionality
    }

    // Import leaflet-draw dynamically to avoid SSR issues
    import('leaflet-draw').then(() => {
      // Create the draw control with only polygon drawing enabled
      const drawControl = new L.Control.Draw({
        edit: {
          featureGroup: new L.FeatureGroup(),
          remove: true,
          edit: false, // Disable edit mode to prevent unwanted modifications
        },
        draw: {
          polygon: {
            allowIntersection: false,
            showArea: true,
            shapeOptions: {
              color: '#16a34a', // Tailwind green-600
              weight: 3,
              opacity: 1,
              fillOpacity: 0.1,
            },
          },
          marker: false,
          circle: false,
          rectangle: false,
          circlemarker: false,
          polyline: false,
        },
      });

      // Add the draw control to the map
      map.addControl(drawControl);

      // Create a feature group to store drawn items
      const drawnItems = new L.FeatureGroup();
      map.addLayer(drawnItems);

      // Handle draw created events
      map.on(DRAW_EVENT_CREATED, (event: L.LeafletEvent) => {
        const layer = (event as DrawCreatedEvent).layer as L.Path & { toGeoJSON(): GeoJSON.GeoJsonObject };
        const type = (event as DrawCreatedEvent).layerType;

        if (type === 'polygon') {
          // Clear any previous polygons
          drawnItems.clearLayers();

          // Add the new polygon to the map
          drawnItems.addLayer(layer);

          // Style the polygon
          layer.setStyle({
            color: '#16a34a',
            weight: 3,
            opacity: 1,
            fillOpacity: 0.1,
          });

          // Convert to GeoJSON and call the callback
          const geoJson = layer.toGeoJSON();
          if (onPolygonComplete) {
            onPolygonComplete(geoJson);
          }
        }
      });

      // Handle draw deleted events
      map.on(DRAW_EVENT_DELETED, () => {
        // Clear all polygons from drawn items
        drawnItems.clearLayers();

        // Notify parent that polygon was removed
        if (onPolygonComplete) {
          onPolygonComplete(null);
        }
      });
    });

    // Cleanup on unmount
    return () => {
      map.off(DRAW_EVENT_CREATED);
      map.off(DRAW_EVENT_DELETED);
    };
  }, [map, onPolygonComplete]);

  return null;
}

export default function SatelliteMapClient({ onPolygonComplete }: SatelliteMapClientProps) {
  return (
    <div className="h-full w-full">
      <MapContainer
        center={[20, 0]} // Default center (can be adjusted based on user location)
        zoom={3}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        {/* Google Maps Satellite tile layer */}
        <TileLayer
          url={`https://mt.googleapis.com/vt/lyrs=s&x={x}&y={y}&z={z}&key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`}
          attribution='Map data ©2025 Google'
        />
        <SatelliteMapContent onPolygonComplete={onPolygonComplete} />
      </MapContainer>
    </div>
  );
}
