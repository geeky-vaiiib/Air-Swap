import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import {
  Home,
  LayoutDashboard,
  Coins,
  FileCheck,
  Settings,
  LogOut,
  ShoppingCart,
  Briefcase,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/authHelpers";
import { useToast } from "@/hooks/use-toast";

type Role = "contributor" | "company" | "verifier";

interface DashboardSidebarProps {
  role: Role;
}

const roleConfig = {
  contributor: {
    title: "Contributor",
    links: [
      { href: "/dashboard/contributor", icon: LayoutDashboard, label: "Overview" },
      { href: "/dashboard/claims/create", icon: FileCheck, label: "Submit Claim" },
      { href: "/dashboard/claims", icon: FileCheck, label: "My Claims" },
      { href: "#", icon: Coins, label: "My Credits" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { href: "/dashboard/company", icon: LayoutDashboard, label: "Overview" },
      { href: "#", icon: ShoppingCart, label: "Marketplace" },
      { href: "#", icon: Briefcase, label: "Portfolio" },
      { href: "#", icon: FileCheck, label: "Transactions" },
    ],
  },
  verifier: {
    title: "Verifier",
    links: [
      { href: "/dashboard/verifier", icon: LayoutDashboard, label: "Overview" },
      { href: "#", icon: FileCheck, label: "Pending Claims" },
      { href: "#", icon: Users, label: "Contributors" },
      { href: "#", icon: Coins, label: "Verified Credits" },
    ],
  },
};

const DashboardSidebar = ({ role }: DashboardSidebarProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const location = { pathname: router.pathname };
  const config = roleConfig[role];

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 bg-gradient-to-b from-forest-dark via-forest to-forest-dark h-screen flex flex-col relative overflow-hidden border-r border-white/10 shadow-xl"
    >
      {/* Texture Overlay */}
      <div className="absolute inset-0 texture-organic opacity-20 pointer-events-none mix-blend-overlay" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Logo */}
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2">
            <Logo variant="full" size="md" className="text-white" />
          </Link>
        </div>

        {/* Role Badge */}
        <div className="px-6 pb-6">
          <div className="px-3 py-2 rounded-xl bg-white/10 backdrop-blur-sm text-center border border-white/5">
            <span className="text-sm font-medium text-teal shadow-glow">{config.title}</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          {config.links.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                  isActive
                    ? "bg-teal/20 text-teal shadow-glow border border-teal/20"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                )}
              >
                <link.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive && "text-teal")} />
                <span className="font-medium">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Links */}
        <div className="p-3 border-t border-white/10 space-y-1 bg-black/20 backdrop-blur-sm">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all group"
          >
            <Home className="w-5 h-5 group-hover:text-teal transition-colors" />
            <span className="font-medium">Home</span>
          </Link>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all group">
            <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform" />
            <span className="font-medium">Settings</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-destructive hover:bg-destructive/10 transition-all group"
          >
            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </motion.aside>
  );
};

export default DashboardSidebar;
