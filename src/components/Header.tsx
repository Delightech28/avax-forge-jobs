import { Button } from "@/components/ui/button";
import { Wallet, Search, Bell, User } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 glass-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-glow rounded-lg flex items-center justify-center glow-effect">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <h1 className="text-xl font-bold gradient-text">AVAX Forge Jobs</h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-foreground/80 hover:text-foreground transition-colors">
              Browse Jobs
            </a>
            <a href="#" className="text-foreground/80 hover:text-foreground transition-colors">
              Post a Job
            </a>
            <a href="#" className="text-foreground/80 hover:text-foreground transition-colors">
              About
            </a>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" className="relative">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></span>
            </Button>
            <Button variant="wallet" className="hidden sm:flex">
              <Wallet className="h-4 w-4" />
              Connect Wallet
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden">
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;