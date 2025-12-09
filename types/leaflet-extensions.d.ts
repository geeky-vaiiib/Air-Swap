/**
 * TypeScript declarations for CI-safe Leaflet extensions.
 * Defines missing types while avoiding conflicts with existing declarations.
 */

// leaflet-control-geocoder already has types in node_modules, only augments if needed
// leaflet.locatecontrol module declaration to prevent TS7016 error
declare module 'leaflet.locatecontrol';

// react-leaflet-draw module declaration
declare module 'react-leaflet-draw' {
  // React integration for leaflet-draw - components export by default
}

// Leaflet namespace extensions for draw events
declare namespace L {
  namespace Draw {
    // Event constants for draw operations
    const Event: {
      readonly CREATED: 'draw:created';
      readonly EDITED: 'draw:edited';
      readonly DELETED: 'draw:deleted';
      readonly DRAWSTART: 'draw:drawstart';
      readonly DRAWSTOP: 'draw:drawstop';
    };

    // Event interface for draw operations
    interface DrawEvent {
      layer: any; // Layer containing GeoJSON methods
      layerType: 'polygon' | 'polyline' | 'rectangle' | 'circle' | 'marker' | 'circlemarker';
    }
  }

  namespace Control {
    // Draw control class definition
    class Draw {
      constructor(options?: DrawControlOptions);
    }

    // Options interface for draw control
    interface DrawControlOptions {
      position?: string;
      draw?: {
        polygon?: DrawPolygonOptions;
        polyline?: DrawPolylineOptions;
        rectangle?: DrawRectangleOptions;
        circle?: DrawCircleOptions;
        marker?: DrawMarkerOptions;
        circlemarker?: DrawCircleMarkerOptions;
      };
      edit?: {
        featureGroup?: any;
        remove?: boolean;
        edit?: boolean;
      };
    }

    // Individual shape option interfaces
    interface DrawPolygonOptions {
      allowIntersection?: boolean;
      showArea?: boolean;
      shapeOptions?: any;
    }

    interface DrawPolylineOptions {
      shapeOptions?: any;
    }

    interface DrawRectangleOptions {
      shapeOptions?: any;
    }

    interface DrawCircleOptions {
      shapeOptions?: any;
    }

    interface DrawMarkerOptions {
      icon?: any;
    }

    interface DrawCircleMarkerOptions {
      shapeOptions?: any;
    }
  }
}

export {};
