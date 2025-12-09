import { motion } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MapToolbarProps {
  onSearch: (query: string) => void;
  onFilterToggle: () => void;
}

const MapToolbar = ({ onSearch, onFilterToggle }: MapToolbarProps) => {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="absolute top-24 left-6 z-[40]"
    >
      <div className="flex items-center gap-2">
        <div className="glass-panel rounded-full p-2 pl-4 flex items-center shadow-lg border border-white/20">
          <Search className="w-5 h-5 text-muted-foreground mr-2" />
          <input
            type="text"
            placeholder="Search location..."
            className="bg-transparent border-none outline-none text-sm w-64 text-foreground placeholder:text-muted-foreground/70"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSearch(e.currentTarget.value);
              }
            }}
          />
        </div>

        <Button
          variant="glass"
          size="icon"
          onClick={onFilterToggle}
          className="rounded-full w-10 h-10 shadow-lg"
        >
          <SlidersHorizontal className="w-4 h-4 text-foreground" />
        </Button>
      </div>
    </motion.div>
  );
};

export default MapToolbar;

