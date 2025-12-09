import L from 'leaflet';

// Draw event types for leaflet-draw
export interface DrawCreatedEvent extends L.LeafletEvent {
  layer: L.Layer;
  layerType: string;
}

export interface DrawDeletedEvent extends L.LeafletEvent {
  layers: L.LayerGroup;
}

// Search provider interface for leaflet-geosearch
export interface SearchResult {
  x: number;
  y: number;
  label: string;
  bounds?: number[][];
  raw?: any;
}

export interface SearchProvider {
  search(options: { query: string }): Promise<SearchResult[]>;
  geocode?(options: { place_id: string }): Promise<SearchResult[]>;
}

export interface GeoSearchControlOptions {
  provider: SearchProvider;
  style?: 'bar' | 'button';
  showMarker?: boolean;
  showPopup?: boolean;
  marker?: {
    icon?: L.Icon;
    draggable?: boolean;
  };
  keepResult?: boolean;
  autoComplete?: boolean;
  autoCompleteDelay?: number;
}

// Google Places API response types
export interface GoogleGeocodeResponse {
  results: GoogleGeocodeResult[];
  status: 'OK' | 'ZERO_RESULTS' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'INVALID_REQUEST';
}

export interface GoogleGeocodeResult {
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
    viewport?: {
      northeast: {
        lat: number;
        lng: number;
      };
      southwest: {
        lat: number;
        lng: number;
      };
    };
  };
  place_id?: string;
}

export interface GooglePlacesDetailsResponse {
  result: {
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    name?: string;
  };
  status: 'OK' | 'ZERO_RESULTS' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'INVALID_REQUEST';
}
