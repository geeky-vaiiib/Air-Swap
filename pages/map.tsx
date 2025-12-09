"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import MapSearchOverlay from "@/components/map/MapSearchOverlay";
import MapDock from "@/components/map/MapDock";
import AnalysisDrawer from "@/components/map/AnalysisDrawer";
import { toast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/ui/loading-spinner";

// Lazy load the map (client-only due to Leaflet)
const LocationSearchMap = dynamic(
  () => import("@/components/map/LocationSearchMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-muted/50">
        <LoadingSpinner size="xl" />
      </div>
    ),
  }
);

type MapMode = "select" | "draw";
type MapLayer = "satellite" | "street";

interface AnalysisData {
  areaHectares: number;
  vegetationHealth: "High" | "Medium" | "Low";
  ndviDelta: number;
  carbonEquivalent: number;
}

const MapPage = () => {
  const router = useRouter();

  // Map state
  const [mode, setMode] = useState<MapMode>("select");
  const [layer, setLayer] = useState<MapLayer>("satellite");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPolygon, setCurrentPolygon] = useState<GeoJSON.GeoJsonObject | null>(null);

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handlers
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    toast({ title: "Searching", description: `Flying to "${query}"...` });
  };

  const handleFilterToggle = () => {
    toast({ title: "Filters", description: "Filter panel coming soon" });
  };

  const handleLocate = () => {
    toast({ title: "Locating", description: "Flying to your location..." });
    // TODO: Integrate with map's locate control
  };

  const handlePolygonComplete = async (geoJson: GeoJSON.GeoJsonObject | null) => {
    if (!geoJson) {
      setIsDrawerOpen(false);
      setAnalysisData(null);
      setCurrentPolygon(null);
      return;
    }

    setCurrentPolygon(geoJson);
    setMode("select");

    toast({
      title: "Analyzing Area...",
      description: "Processing satellite imagery for NDVI data.",
    });

    try {
      const res = await fetch('/api/ndvi-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ polygon: geoJson }),
      });
      const data = await res.json();

      if (data.ndviDelta) {
        setAnalysisData({
          areaHectares: 12.5, // TODO: Calculate actual area from Polygon using Turf.js
          vegetationHealth: data.ndviDelta > 0.5 ? "High" : "Medium",
          ndviDelta: Math.round(data.ndviDelta * 100),
          carbonEquivalent: Math.round(data.ndviDelta * 5000), // Mock calculation based on NDVI
        });
        setIsDrawerOpen(true);
      } else {
        throw new Error("Failed to analyze area");
      }

    } catch (error) {
      console.error("Analysis failed", error);
      toast({
        title: "Analysis Failed",
        description: "Could not fetch satellite data. Using estimation.",
        variant: "destructive",
      });

      // Fallback for demo continuity if API fails
      setAnalysisData({
        areaHectares: 12.5,
        vegetationHealth: "Medium",
        ndviDelta: 15,
        carbonEquivalent: 750,
      });
      setIsDrawerOpen(true);
    }
  };

  const handleVerifyClaim = async () => {
    if (!currentPolygon || !analysisData) return;

    setIsSubmitting(true);
    try {
      // 1. Submit the claim
      const response = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: searchQuery || 'Selected Area',
          polygon: currentPolygon,
          area: analysisData.areaHectares,
          ndvi_delta: analysisData.ndviDelta,
          // evidence_cids: [] // We normally upload first
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Claim Submitted! 🎉",
          description: "Your land claim has been submitted for verification.",
        });
        setIsDrawerOpen(false);
        // Redirect to dashboard
        router.push('/dashboard/contributor');
      } else {
        throw new Error(data.error || 'Submission failed');
      }
    } catch (error) {
      console.error('Claim submission error:', error);
      toast({
        title: "Error",
        description: "Failed to submit claim. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-muted">
      {/* Layer 0: Full-Screen Map */}
      <div className="absolute inset-0 z-0">
        <Suspense
          fallback={
            <div className="h-full w-full flex items-center justify-center bg-muted/50">
              <LoadingSpinner size="xl" />
            </div>
          }
        >
          <LocationSearchMap
            onPolygonComplete={handlePolygonComplete}
            searchQuery={searchQuery}
          />
        </Suspense>
      </div>

      {/* Layer 1: UI Overlays (pointer-events-none container) */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Search Pill (Top-Left) */}
        <MapSearchOverlay
          onSearch={handleSearch}
          onFilterToggle={handleFilterToggle}
        />

        {/* Control Dock (Bottom-Center) */}
        <MapDock
          mode={mode}
          layer={layer}
          onModeChange={setMode}
          onLocate={handleLocate}
          onLayerChange={setLayer}
        />
      </div>

      {/* Loading Overlay */}
      {mode === "draw" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
        >
          <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium shadow-glow">
            Click on the map to draw an area
          </div>
        </motion.div>
      )}

      {/* Analysis Drawer (Right) */}
      <AnalysisDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        data={analysisData}
        onVerifyClaim={handleVerifyClaim}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export const getServerSideProps = async () => {
  return { props: {} };
};

export default MapPage;
