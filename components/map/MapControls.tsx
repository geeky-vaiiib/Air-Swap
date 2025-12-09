
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Layers, MapPin, PenTool } from "lucide-react";
import { cn } from "@/lib/utils";

interface MapControlsProps {
    activeTool: "select" | "polygon";
    onToolChange: (tool: "select" | "polygon") => void;
    onLocate: () => void;
    onToggleLayers: () => void;
}

export function MapControls({
    activeTool,
    onToolChange,
    onLocate,
    onToggleLayers,
}: MapControlsProps) {
    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[40]"
        >
            <TooltipProvider>
                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl border border-white/20 p-2 rounded-full shadow-2xl">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={activeTool === "polygon" ? "default" : "ghost"}
                                size="icon"
                                className={cn(
                                    "rounded-full w-12 h-12 transition-all duration-300",
                                    activeTool === "polygon"
                                        ? "bg-primary text-primary-foreground shadow-glow scale-110"
                                        : "text-white hover:bg-white/20"
                                )}
                                onClick={() => onToolChange(activeTool === "polygon" ? "select" : "polygon")}
                            >
                                <PenTool className="w-5 h-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Draw Area</p>
                        </TooltipContent>
                    </Tooltip>

                    <div className="w-px h-8 bg-white/20" />

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full w-12 h-12 text-white hover:bg-white/20 transition-all duration-300"
                                onClick={onLocate}
                            >
                                <MapPin className="w-5 h-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>My Location</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full w-12 h-12 text-white hover:bg-white/20 transition-all duration-300"
                                onClick={onToggleLayers}
                            >
                                <Layers className="w-5 h-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Layers</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </TooltipProvider>
        </motion.div>
    );
}

