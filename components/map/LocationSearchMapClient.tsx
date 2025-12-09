'use client';

import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-geosearch/dist/geosearch.css';
import 'leaflet.locatecontrol/dist/L.Control.Locate.css';
import {
  SearchProvider,
  SearchResult,
  DrawCreatedEvent,
  GoogleGeocodeResponse,
  GoogleGeocodeResult,
  GooglePlacesDetailsResponse,
} from '../../types/leaflet-custom';

// Custom Google Places Provider
class GooglePlacesProvider implements SearchProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async search(options: { query: string }): Promise<SearchResult[]> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(options.query)}&key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error('Google Geocoding API request failed');
      }

      const data: GoogleGeocodeResponse = await response.json();

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new Error(`Google Geocoding API error: ${data.status}`);
      }

      return data.results.slice(0, 5).map((result: GoogleGeocodeResult): SearchResult => ({
        x: result.geometry.location.lng,
        y: result.geometry.location.lat,
        label: result.formatted_address,
        bounds: result.geometry.viewport ? [
          [result.geometry.viewport.northeast.lat, result.geometry.viewport.northeast.lng] as [number, number],
          [result.geometry.viewport.southwest.lat, result.geometry.viewport.southwest.lng] as [number, number]
        ] : [
          [result.geometry.location.lat - 0.01, result.geometry.location.lng - 0.01] as [number, number],
          [result.geometry.location.lat + 0.01, result.geometry.location.lng + 0.01] as [number, number]
        ],
      }));
    } catch (error) {
      console.warn('Google Geocoding search failed:', error);
      return [];
    }
  }

  async geocode(options: { place_id: string }): Promise<SearchResult[]> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${options.place_id}&key=${this.apiKey}&fields=geometry`
      );

      if (!response.ok) {
        throw new Error('Google Places details API request failed');
      }

      const data: GooglePlacesDetailsResponse = await response.json();

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

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationSearchMapClientProps {
  onPolygonComplete?: (geoJson: GeoJSON.GeoJsonObject | null) => void;
  searchQuery?: string;
}

// Constants for leaflet-draw events
const DRAW_EVENT_CREATED = 'draw:created';
const DRAW_EVENT_DELETED = 'draw:deleted';

function MapController({ onPolygonComplete, searchQuery }: LocationSearchMapClientProps) {
  const map = useMap();
  const searchProviderRef = useRef<GooglePlacesProvider | null>(null);

  // Initialize Search Provider
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    if (apiKey) {
      searchProviderRef.current = new GooglePlacesProvider(apiKey);
    }
  }, []);

  // External Search Handler
  useEffect(() => {
    if (searchQuery && searchProviderRef.current && map) {
      const performSearch = async () => {
        const results = await searchProviderRef.current?.search({ query: searchQuery });
        if (results && results.length > 0) {
          const firstResult = results[0];
          if (firstResult.bounds) {
            map.fitBounds(firstResult.bounds as L.LatLngBoundsExpression);
          } else {
            map.flyTo([firstResult.y, firstResult.x], 16);
          }
        }
      };
      performSearch();
    }
  }, [searchQuery, map]);

  useEffect(() => {
    if (!map) return;

    // Add GPS locate control
    try {
      // @ts-ignore - leaflet.locatecontrol has no @types package
      import('leaflet.locatecontrol').then((LocateControlModule) => {
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
    }

    // Import leaflet-draw dynamically
    import('leaflet-draw').then(() => {
      const drawControl = new L.Control.Draw({
        edit: {
          featureGroup: new L.FeatureGroup(),
          remove: true,
          edit: false,
        },
        draw: {
          polygon: {
            allowIntersection: false,
            showArea: true,
            shapeOptions: {
              color: '#10b981', // brand-nature
              weight: 3,
              opacity: 1,
              fillOpacity: 0.2,
            },
          },
          marker: false,
          circle: false,
          rectangle: false,
          circlemarker: false,
          polyline: false,
        },
      });

      map.addControl(drawControl);

      const drawnItems = new L.FeatureGroup();
      map.addLayer(drawnItems);

      map.on(DRAW_EVENT_CREATED, (event: L.LeafletEvent) => {
        const layer = (event as DrawCreatedEvent).layer as L.Path & { toGeoJSON(): GeoJSON.GeoJsonObject };
        const type = (event as DrawCreatedEvent).layerType;

        if (type === 'polygon') {
          drawnItems.clearLayers();
          drawnItems.addLayer(layer);

          layer.setStyle({
            color: '#10b981', // brand-nature
            weight: 3,
            opacity: 1,
            fillOpacity: 0.2,
          });

          const geoJson = layer.toGeoJSON();
          if (onPolygonComplete) {
            onPolygonComplete(geoJson);
          }
        }
      });

      map.on(DRAW_EVENT_DELETED, () => {
        drawnItems.clearLayers();
        if (onPolygonComplete) {
          onPolygonComplete(null);
        }
      });
    });

    return () => {
      map.off(DRAW_EVENT_CREATED);
      map.off(DRAW_EVENT_DELETED);
    };
  }, [map, onPolygonComplete]);

  return null;
}

export default function LocationSearchMapClient({ onPolygonComplete, searchQuery }: LocationSearchMapClientProps) {
  return (
    <div className="h-full w-full">
      <MapContainer
        center={[20, 0]}
        zoom={3}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false} // Hide default zoom control for cleaner UI
      >
        <TileLayer
          url={`https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`}
          attribution='© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://www.maxar.com/">Maxar</a>'
          tileSize={512}
          zoomOffset={-1}
          maxNativeZoom={18}
          maxZoom={22}
        />
        <MapController onPolygonComplete={onPolygonComplete} searchQuery={searchQuery} />
      </MapContainer>
    </div>
  );
}
