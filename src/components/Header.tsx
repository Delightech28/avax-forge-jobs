import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Bell, User, LogOut } from "lucide-react";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleAuthAction = () => {
    if (user) {
      signOut();
    } else {
      navigate('/auth');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 glass-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold gradient-text">AVAX Forge Jobs</h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="/jobs" className="text-foreground/80 hover:text-foreground transition-colors">
              Browse Jobs
            </a>
            <a href="/post-job" className="text-foreground/80 hover:text-foreground transition-colors">
              Post a Job
            </a>
            <a href="#" className="text-foreground/80 hover:text-foreground transition-colors">
              About
            </a>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
            </Button>
            
            {user ? (
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8 cursor-pointer" onClick={() => navigate('/profile')}>
                  <AvatarImage src={user.profile?.avatar_url} />
                  <AvatarFallback>
                    {user.profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleAuthAction}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button 
                variant="ghost" 
                onClick={handleAuthAction}
                className="hidden sm:flex"
              >
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={handleAuthAction}
            >
              {user ? <LogOut className="h-4 w-4" /> : <User className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;