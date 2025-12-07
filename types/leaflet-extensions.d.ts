/**
 * TypeScript declarations for Leaflet extensions used in the satellite map components.
 * This provides basic type safety for leaflet-geosearch and leaflet-draw libraries.
 *
 * Note: Since leaflet-geosearch already provides type declarations in node_modules,
 * and leaflet.locatecontrol doesn't have @types package, the components use local casting
 * and constants for proper TypeScript compliance without needing problematic declarations.
 */

// Simple declaration for leaflet.locatecontrol to resolve TypeScript errors
declare module 'leaflet.locatecontrol';

export {};
