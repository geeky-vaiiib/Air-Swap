import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Map as MapIcon, Satellite } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NDVIData {
  ndviDelta: number;
  beforeImage: string;
  afterImage: string;
}

interface RightPanelProps {
  isOpen: boolean;
  onClose: () => void;
  ndviData: NDVIData | null;
  onIssueCredit: () => void;
}

const RightPanel = ({ isOpen, onClose, ndviData, onIssueCredit }: RightPanelProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="absolute right-0 top-0 bottom-0 w-full md:w-[450px] bg-background/80 backdrop-blur-xl border-l border-white/20 shadow-2xl z-[50]"
        >
          <div className="h-full flex flex-col relative">
            {/* Header */}
            <div className="p-6 border-b border-border/10 flex items-center justify-between bg-white/5">
              <div>
                <h2 className="font-display font-bold text-2xl text-foreground">
                  Area Analysis
                </h2>
                <p className="text-sm text-muted-foreground">
                  Satellite Verification Report
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {ndviData ? (
                <div className="space-y-8">
                  {/* KPI Card */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-primary uppercase tracking-wider">NDVI Growth</span>
                      <span className="px-2 py-1 bg-primary/20 rounded text-xs text-primary font-bold">+12% vs last year</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-display font-bold text-primary">
                        +{ndviData.ndviDelta}%
                      </span>
                      <span className="text-muted-foreground">vegetation index</span>
                    </div>
                  </div>

                  {/* Visual Analysis Tabs */}
                  <Tabs defaultValue="satellite" className="w-full">
                    <TabsList className="w-full grid grid-cols-2 bg-white/5">
                      <TabsTrigger value="satellite">Satellite</TabsTrigger>
                      <TabsTrigger value="analysis">Analysis</TabsTrigger>
                    </TabsList>

                    <TabsContent value="satellite" className="mt-4 space-y-4">

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <span className="text-xs font-semibold text-muted-foreground uppercase">2023 (Before)</span>
                          <div className="aspect-square rounded-xl overflow-hidden border border-white/10 relative group">
                            <img
                              src={ndviData.beforeImage}
                              alt="Before"
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <span className="text-xs font-semibold text-muted-foreground uppercase">2024 (Current)</span>
                          <div className="aspect-square rounded-xl overflow-hidden border border-primary/30 relative group">
                            <img
                              src={ndviData.afterImage}
                              alt="After"
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute top-2 right-2 px-2 py-1 bg-primary text-primary-foreground text-xs font-bold rounded">
                              Verified
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="analysis" className="mt-4">
                      <div className="p-6 rounded-xl border border-dashed border-border text-center space-y-4">
                        <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                          <Satellite className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                          <p className="font-medium">Deep Spectral Analysis</p>
                          <p className="text-sm text-muted-foreground">AI processing of chlorophyll levels...</p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Metadata List */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-foreground">Parcel Details</h4>
                    <div className="bg-white/5 rounded-xl p-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location</span>
                        <span className="text-foreground font-mono">Amazonas, BR</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Area</span>
                        <span className="text-foreground font-mono">14.2 Hectares</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Carbon Equiv.</span>
                        <span className="text-foreground font-mono">847 tCO2e</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                  <MapIcon className="w-16 h-16 text-muted-foreground" />
                  <p className="text-lg font-medium">Select an area on the map</p>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Use the Draw tool to define a boundary for analysis.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {ndviData && (
              <div className="p-6 border-t border-border/10 bg-white/5 backdrop-blur-md sticky bottom-0">
                <Button
                  onClick={onIssueCredit}
                  variant="hero"
                  className="w-full h-14 text-lg shadow-glow hover:shadow-glow-lg transition-all"
                >
                  <CheckCircle className="w-6 h-6 mr-2" />
                  Verify & Issue Credits
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RightPanel;
