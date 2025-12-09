"use client";

import { motion } from "framer-motion";
import { PenTool, Navigation, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type MapMode = "select" | "draw";
type MapLayer = "satellite" | "street";

interface MapDockProps {
    mode: MapMode;
    layer: MapLayer;
    onModeChange: (mode: MapMode) => void;
    onLocate: () => void;
    onLayerChange: (layer: MapLayer) => void;
}

const MapDock = ({
    mode,
    layer,
    onModeChange,
    onLocate,
    onLayerChange,
}: MapDockProps) => {
    const dockItems = [
        {
            id: "draw",
            icon: PenTool,
            label: "Draw Area",
            isActive: mode === "draw",
            onClick: () => onModeChange(mode === "draw" ? "select" : "draw"),
        },
        {
            id: "locate",
            icon: Navigation,
            label: "My Location",
            isActive: false,
            onClick: onLocate,
        },
        {
            id: "layers",
            icon: Layers,
            label: layer === "satellite" ? "Street View" : "Satellite View",
            isActive: false,
            onClick: () => onLayerChange(layer === "satellite" ? "street" : "satellite"),
        },
    ];

    return (
        <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-auto"
        >
            <TooltipProvider delayDuration={100}>
                <div className="flex items-center gap-2 bg-white/90 backdrop-blur-xl rounded-2xl p-2 shadow-soft-lg border border-white/50">
                    {dockItems.map((item) => (
                        <Tooltip key={item.id}>
                            <TooltipTrigger asChild>
                                <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                        variant={item.isActive ? "default" : "ghost"}
                                        size="icon"
                                        onClick={item.onClick}
                                        className={cn(
                                            "rounded-xl w-12 h-12 transition-all duration-200",
                                            item.isActive
                                                ? "bg-primary text-primary-foreground shadow-glow"
                                                : "text-foreground hover:bg-muted"
                                        )}
                                    >
                                        <item.icon className="w-5 h-5" />
                                    </Button>
                                </motion.div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="bg-foreground text-background font-medium">
                                {item.label}
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </div>
            </TooltipProvider>
        </motion.div>
    );
};

export default MapDock;
