import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Bell, User, LogOut, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";

interface Profile {
  avatar_url?: string;
  full_name?: string;
}

interface User {
  avatarUrl?: string;
  profile?: Profile;
  fullName?: string;
  email?: string;
  role?: string;
}

const Header = () => {
  const { user, signOut } = useAuth() as { user: User | null, signOut: () => void };
  const navigate = useNavigate();
  const [messageCount, setMessageCount] = useState(0);

  useEffect(() => {
    // Set mock unread message count for now
    if (user) {
      setMessageCount(3); // Mock data - replace with real Firestore query later
    }
  }, [user]);

  const handleAuthAction = () => {
    if (user) {
      signOut();
      navigate('/auth');
    } else {
      navigate('/auth');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 glass-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo - use image from public folder, clickable to go home */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/') }>
            <img src="/logo.png" alt="Logo" className="h-10 w-10 rounded-full object-cover" />
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {user?.role !== 'company' && (
              <a href="/jobs" className="text-foreground/80 hover:text-foreground transition-colors">
                Browse Jobs
              </a>
            )}
            {user?.role === 'company' && (
              <a href="/post-job" className="text-foreground/80 hover:text-foreground transition-colors">
                Post a Job
              </a>
            )}
          </nav>

          {/* Right side actions - restore to original position */}
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => navigate('/notifications')}
                  className="text-muted-foreground hover:text-foreground relative"
                >
                  <Bell className="h-4 w-4" />
                  {(() => {
                    const count = parseInt((typeof window !== 'undefined' && window.localStorage.getItem('unreadCount')) || '0', 10);
                    return count > 0 ? (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] leading-none rounded-full min-w-[14px] h-[14px] px-[3px] flex items-center justify-center">
                        {count > 9 ? '9+' : count}
                      </div>
                    ) : null;
                  })()}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => navigate('/messages')}
                  className="text-muted-foreground hover:text-foreground relative"
                  title="Messages"
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </>
            )}
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Avatar className="h-8 w-8 cursor-pointer" onClick={() => navigate('/profile')}>
                    <AvatarImage src={user.avatarUrl || user.profile?.avatar_url} />
                    <AvatarFallback>
                      {user.fullName?.charAt(0) || user.profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
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
                variant="default"
                onClick={handleAuthAction}
                className="flex"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;