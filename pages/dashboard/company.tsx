"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Briefcase, TrendingUp, ShoppingCart, Coins, ArrowRight } from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import MarketplaceCard from "@/components/dashboard/MarketplaceCard";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface MarketplaceItem {
  id: string;
  contributor: string;
  ndviDelta: number;
  credits: number;
  date: string;
  price: number;
}

const CompanyDashboard = () => {
  const [marketplaceItems, setMarketplaceItems] = useState<MarketplaceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMarketplace = async () => {
      try {
        const res = await fetch('/api/marketplace');
        const data = await res.json();
        if (data.success) {
          const items = data.data.map((item: any) => ({
            id: item._id,
            contributor: item.seller?.full_name || 'Unknown Seller',
            ndviDelta: item.credit?.ndviDelta || 0, // Fallback as deep lookup might be missing
            credits: item.quantity,
            date: new Date(item.created_at).toLocaleDateString(),
            price: item.price
          }));
          setMarketplaceItems(items);
        }
      } catch (error) {
        console.error('Failed to fetch marketplace:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketplace();
  }, []);

  const handleBuy = (id: string) => {
    toast({
      title: "Purchase feature coming soon",
      description: `Purchase logic will be integrated with smart contracts. Item: ${id}`,
    });
  };

  return (
    <div className="flex h-screen bg-sand">
      <DashboardSidebar role="company" />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-display font-bold text-forest mb-2">
              Company Dashboard
            </h1>
            <p className="text-muted-foreground">
              Browse and purchase verified Oxygen Credits.
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-teal/20 flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-teal" />
                </div>
              </div>
              <div className="text-2xl font-display font-bold text-forest">
                2,450
              </div>
              <div className="text-sm text-muted-foreground">Portfolio Credits</div>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-forest/10 flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-forest" />
                </div>
              </div>
              <div className="text-2xl font-display font-bold text-forest">
                12
              </div>
              <div className="text-sm text-muted-foreground">Purchases</div>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald" />
                </div>
              </div>
              <div className="text-2xl font-display font-bold text-forest">
                +8.3%
              </div>
              <div className="text-sm text-muted-foreground">Portfolio Growth</div>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Coins className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <div className="text-2xl font-display font-bold text-forest">
                $28,450
              </div>
              <div className="text-sm text-muted-foreground">Total Invested</div>
            </div>
          </motion.div>

          {/* Marketplace */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold text-forest">
                Marketplace
              </h2>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  Filters
                </Button>
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {marketplaceItems.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    No marketplace listings available. Check back later for new listings.
                  </div>
                ) : (
                  marketplaceItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <MarketplaceCard
                        {...item}
                        onBuy={() => handleBuy(item.id)}
                      />
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </motion.div>

          {/* Portfolio Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold text-forest">
                My Portfolio
              </h2>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="grid grid-cols-3 gap-6">
                {[
                  { name: "Amazon Credits", credits: 1200, growth: "+12%" },
                  { name: "Congo Credits", credits: 850, growth: "+8%" },
                  { name: "Indonesia Credits", credits: 400, growth: "+5%" },
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-xl bg-forest/5">
                    <div className="text-sm text-muted-foreground mb-1">
                      {item.name}
                    </div>
                    <div className="flex items-end justify-between">
                      <span className="text-xl font-display font-bold text-forest">
                        {item.credits}
                      </span>
                      <span className="text-sm text-teal font-medium">
                        {item.growth}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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

export default CompanyDashboard;
