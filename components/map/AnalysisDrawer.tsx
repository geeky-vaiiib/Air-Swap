"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Leaf, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnalysisData {
    areaHectares: number;
    vegetationHealth: "High" | "Medium" | "Low";
    ndviDelta: number;
    carbonEquivalent: number;
}

interface AnalysisDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    data: AnalysisData | null;
    onVerifyClaim: () => void;
    isLoading?: boolean;
}

const healthColors = {
    High: "bg-primary/20 text-primary border-primary/30",
    Medium: "bg-amber-500/20 text-amber-600 border-amber-500/30",
    Low: "bg-destructive/20 text-destructive border-destructive/30",
};

const AnalysisDrawer = ({
    isOpen,
    onClose,
    data,
    onVerifyClaim,
    isLoading = false,
}: AnalysisDrawerProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", damping: 30, stiffness: 300 }}
                    className="absolute right-0 top-0 bottom-0 w-full sm:w-[400px] bg-white/95 backdrop-blur-2xl shadow-2xl z-20 pointer-events-auto border-l border-white/30"
                >
                    <div className="h-full flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-border/20">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Leaf className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="font-display font-bold text-lg text-foreground">
                                        Area Analysis
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        Satellite Verification
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="rounded-full hover:bg-muted"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {data ? (
                                <>
                                    {/* Area Verified */}
                                    <div className="p-5 rounded-2xl bg-muted/50 border border-border/30">
                                        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                                            Area Verified
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-display font-bold text-foreground">
                                                {data.areaHectares.toFixed(1)}
                                            </span>
                                            <span className="text-lg text-muted-foreground">hectares</span>
                                        </div>
                                    </div>

                                    {/* Vegetation Health */}
                                    <div className="p-5 rounded-2xl bg-muted/50 border border-border/30">
                                        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                                            Vegetation Health
                                        </div>
                                        <div
                                            className={cn(
                                                "inline-flex items-center gap-2 px-4 py-2 rounded-full border font-semibold",
                                                healthColors[data.vegetationHealth]
                                            )}
                                        >
                                            <span className="w-2 h-2 rounded-full bg-current" />
                                            {data.vegetationHealth}
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                                            <TrendingUp className="w-5 h-5 text-primary mb-2" />
                                            <div className="text-2xl font-display font-bold text-primary">
                                                +{data.ndviDelta}%
                                            </div>
                                            <div className="text-xs text-muted-foreground">NDVI Growth</div>
                                        </div>
                                        <div className="p-4 rounded-xl bg-accent/5 border border-accent/10">
                                            <Leaf className="w-5 h-5 text-accent mb-2" />
                                            <div className="text-2xl font-display font-bold text-accent">
                                                {data.carbonEquivalent}
                                            </div>
                                            <div className="text-xs text-muted-foreground">tCO₂e</div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="h-full flex items-center justify-center text-center text-muted-foreground">
                                    <div className="space-y-2">
                                        <Leaf className="w-12 h-12 mx-auto opacity-30" />
                                        <p>Draw an area on the map to analyze</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {data && (
                            <div className="p-6 border-t border-border/20 bg-muted/30">
                                <Button
                                    onClick={onVerifyClaim}
                                    variant="hero"
                                    size="lg"
                                    disabled={isLoading}
                                    className="w-full h-14 text-base"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-5 h-5 mr-2" />
                                            Verify Claim
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// Helper function (cn is usually imported, adding inline for safety)
function cn(...classes: (string | undefined | false)[]) {
    return classes.filter(Boolean).join(" ");
}

export default AnalysisDrawer;
