import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, XCircle, AlertCircle, Calendar, TrendingUp, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VerifierModalProps {
  isOpen: boolean;
  onClose: () => void;
  claim: {
    id: string;
    contributor: string;
    location: string;
    date: string;
    ndviDelta: number;
    beforeImage: string;
    afterImage: string;
  } | null;
  onApprove: () => void;
  onReject: () => void;
  onRequestMore: () => void;
}

const VerifierModal = ({
  isOpen,
  onClose,
  claim,
  onApprove,
  onReject,
  onRequestMore,
}: VerifierModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && claim && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-forest/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-card rounded-3xl shadow-soft-lg z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-forest text-xl">
                  Verify Claim
                </h3>
                <p className="text-sm text-muted-foreground">
                  Review satellite data and evidence
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl hover:bg-forest/10 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-forest" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Claim Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted border border-border">
                  <div className="w-10 h-10 rounded-lg bg-forest/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-forest" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-muted-foreground">Submitted</div>
                    <div className="font-medium text-forest truncate">{claim.date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-teal/10 border border-teal/20">
                  <div className="w-10 h-10 rounded-lg bg-teal/20 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-teal" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-teal-700 dark:text-teal-300">NDVI Change</div>
                    <div className="font-bold text-teal text-lg">+{claim.ndviDelta}%</div>
                  </div>
                </div>
              </div>

              {/* Satellite Images */}
              <div className="space-y-3">
                <h4 className="font-medium text-forest">Satellite Imagery</h4>
                <div className="grid grid-cols-2 gap-4">
                  {/* Before Image */}
                  <div className="space-y-2">
                    <div className="aspect-video rounded-xl bg-muted overflow-hidden relative border border-border">
                      {claim.beforeImage ? (
                        <img
                          src={claim.beforeImage}
                          alt="Before"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            if (target.nextElementSibling) {
                              (target.nextElementSibling as HTMLElement).style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div 
                        className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950"
                        style={{ display: claim.beforeImage ? 'none' : 'flex' }}
                      >
                        <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center mb-2">
                          <MapPin className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                        </div>
                        <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">Before Image</p>
                        <p className="text-xs text-muted-foreground">Satellite data pending</p>
                      </div>
                      <div className="absolute bottom-2 left-2 px-3 py-1 rounded-lg bg-gray-900/70 backdrop-blur-sm text-white text-xs font-medium">
                        Before
                      </div>
                    </div>
                  </div>
                  
                  {/* After Image */}
                  <div className="space-y-2">
                    <div className="aspect-video rounded-xl bg-muted overflow-hidden relative border border-border">
                      {claim.afterImage ? (
                        <img
                          src={claim.afterImage}
                          alt="After"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            if (target.nextElementSibling) {
                              (target.nextElementSibling as HTMLElement).style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div 
                        className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950 dark:to-emerald-950"
                        style={{ display: claim.afterImage ? 'none' : 'flex' }}
                      >
                        <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center mb-2">
                          <TrendingUp className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                        </div>
                        <p className="text-sm text-teal-600 dark:text-teal-400 font-medium">After Image</p>
                        <p className="text-xs text-muted-foreground">Satellite data pending</p>
                      </div>
                      <div className="absolute bottom-2 left-2 px-3 py-1 rounded-lg bg-teal-600/80 backdrop-blur-sm text-white text-xs font-medium">
                        After
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Evidence */}
              <div className="space-y-3">
                <h4 className="font-medium text-forest flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Evidence Photos
                </h4>
                <div className="p-6 rounded-xl border-2 border-dashed border-border bg-muted/30 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">No additional evidence uploaded</p>
                    <p className="text-xs text-muted-foreground">Satellite imagery is the primary evidence</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border bg-muted/30">
              <div className="flex gap-3">
                <Button 
                  onClick={onReject} 
                  variant="outline" 
                  className="flex-1 gap-2 border-destructive text-destructive hover:bg-destructive hover:text-white"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </Button>
                <Button 
                  onClick={onRequestMore} 
                  variant="outline" 
                  className="flex-1 gap-2"
                >
                  <AlertCircle className="w-4 h-4" />
                  Request More
                </Button>
                <Button 
                  onClick={onApprove} 
                  className="flex-1 gap-2 bg-teal hover:bg-teal/90 text-white"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default VerifierModal;
