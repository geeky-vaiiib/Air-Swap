'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface SatelliteMapClientProps {
  onPolygonComplete?: (geoJson: any) => void;
}

function SatelliteMapContent({ onPolygonComplete }: SatelliteMapClientProps) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Create and add the geosearch control
    const provider = new (OpenStreetMapProvider as any)();
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
    });

    map.addControl(searchControl);

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
      map.on((L.Draw as any).Event.CREATED, (event: any) => {
        const layer = event.layer;
        const type = event.layerType;

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
      map.on((L.Draw as any).Event.DELETED, () => {
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
      map.off((L.Draw as any).Event.CREATED);
      map.off((L.Draw as any).Event.DELETED);
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
        {/* Esri World Imagery tile layer for satellite imagery */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        />
        <SatelliteMapContent onPolygonComplete={onPolygonComplete} />
      </MapContainer>
    </div>
  );
}
