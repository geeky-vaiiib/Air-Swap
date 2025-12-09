"use client";

import { motion } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface MapSearchOverlayProps {
    onSearch: (query: string) => void;
    onFilterToggle: () => void;
}

const MapSearchOverlay = ({ onSearch, onFilterToggle }: MapSearchOverlayProps) => {
    const [query, setQuery] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query.trim());
        }
    };

    return (
        <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
            className="absolute top-6 left-6 z-10 pointer-events-auto"
        >
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
                {/* Search Pill */}
                <div className="flex items-center gap-3 bg-white/90 backdrop-blur-xl rounded-full pl-5 pr-2 py-2 shadow-soft-lg border border-white/50">
                    <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search location..."
                        className="bg-transparent border-none outline-none text-sm w-56 text-foreground placeholder:text-muted-foreground/60 font-medium"
                    />
                </div>

                {/* Filter Button */}
                <Button
                    type="button"
                    variant="glass"
                    size="icon"
                    onClick={onFilterToggle}
                    className="rounded-full w-11 h-11 bg-white/90 backdrop-blur-xl shadow-soft-lg border border-white/50 hover:bg-white"
                >
                    <SlidersHorizontal className="w-4 h-4 text-foreground" />
                </Button>
            </form>
        </motion.div>
    );
};

export default MapSearchOverlay;
