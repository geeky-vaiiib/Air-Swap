"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Plus, TrendingUp, Coins, MapPin, ArrowRight } from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import ClaimCard from "@/components/dashboard/ClaimCard";
import { Button } from "@/components/ui/button";
import type { Claim } from "@/lib/types/claims";
import { useToast } from "@/hooks/use-toast";

const ContributorDashboard = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const response = await fetch('/api/claims');
        if (!response.ok) throw new Error('Failed to fetch claims');
        const data = await response.json();
        setClaims(data.data || []);
      } catch (error) {
        console.error('Error fetching claims:', error);
        toast({
          title: "Error",
          description: "Failed to load claims. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchClaims();
  }, [toast]);

  // Calculate stats
  const totalCredits = 0; // TODO: Fetch from credits API
  const activeClaims = claims.filter(c => c.status === 'pending' || c.status === 'verified').length;
  // const avgNdvi = claims.length > 0
  //   ? claims.reduce((acc, curr) => acc + (curr.ndviDelta || 0), 0) / claims.length
  //   : 0;

  return (
    <div className="flex h-screen bg-sand">
      <DashboardSidebar role="contributor" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-display font-bold text-forest mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-muted-foreground">
              Track your claims and earnings in one place.
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-teal/20 flex items-center justify-center">
                  <Coins className="w-6 h-6 text-teal" />
                </div>
              </div>
              <div className="text-2xl font-display font-bold text-forest">
                {totalCredits.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Credits</div>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-forest/10 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-forest" />
                </div>
                <span className="text-xs text-forest font-medium">{activeClaims} active</span>
              </div>
              <div className="text-2xl font-display font-bold text-forest">
                {claims.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Claims</div>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald" />
                </div>
                <span className="text-xs text-emerald font-medium">Healthy</span>
              </div>
              <div className="text-2xl font-display font-bold text-forest">
                High
              </div>
              <div className="text-sm text-muted-foreground">Vegetation Health</div>
            </div>
          </motion.div>

          {/* Quick Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6 mb-8 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-forest to-emerald flex items-center justify-center">
                <Plus className="w-7 h-7 text-teal" />
              </div>
              <div>
                <h3 className="font-display font-bold text-forest text-lg">
                  Submit New Claim
                </h3>
                <p className="text-sm text-muted-foreground">
                  Draw your land on the map and get it verified
                </p>
              </div>
            </div>
            <Link href="/dashboard/claims/create">
              <Button variant="hero">
                Submit Claim
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>

          {/* Claims List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold text-forest">
                My Claims
              </h2>
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {claims.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    No claims found. Submit your first claim to get started.
                  </div>
                ) : (
                  claims.map((claim, index) => (
                    <motion.div
                      key={claim.id || (claim as any)._id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      <ClaimCard
                        id={claim.id || (claim as any)._id || 'unknown'}
                        location={claim.location}
                        area={claim.area ? `${claim.area} ha` : 'N/A'}
                        date={new Date(claim.created_at || Date.now()).toLocaleDateString()}
                        status={claim.status}
                        credits={claim.credits}
                        ndviDelta={claim.ndvi_delta}
                      />
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export const getServerSideProps = async () => {
  return {
    props: {}
  };
};

export default ContributorDashboard;
