import { Button } from "@/components/ui/button";
import { Users } from "@/components/ui/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Bell, User, LogOut, MessageSquare } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { db } from '@/integrations/firebase/client';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface Profile {
  avatar_url?: string;
  full_name?: string;
}

interface User {
  avatar?: string;
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
  const [notificationCount, setNotificationCount] = useState<number>(0);



  // Listen for unread chat messages in all conversations
  useEffect(() => {
    if (!user || !('id' in user) || !user.id) return;
    const userId = user.id;
    let unsubConvs: (() => void) | null = null;
    let unsubMsgs: (() => void)[] = [];
    const unreadMap: Record<string, number> = {};
    const convQ = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId)
    );
    unsubConvs = onSnapshot(convQ, (convSnap) => {
      unsubMsgs.forEach(unsub => unsub());
      unsubMsgs = [];
      convSnap.docs.forEach(convDoc => {
        const convId = convDoc.id;
        const msgQ = query(
          collection(db, 'conversations', convId, 'messages'),
          where('read', '==', false)
        );
        const unsub = onSnapshot(msgQ, (msgSnap) => {
          const unread = msgSnap.docs.filter(doc => doc.data().sender !== userId).length;
          unreadMap[convId] = unread;
          const sum = Object.values(unreadMap).reduce((a, b) => (typeof a === 'number' ? a : 0) + (typeof b === 'number' ? b : 0), 0);
          setMessageCount(sum);
        });
        unsubMsgs.push(unsub);
      });
    });
    // Listen for unread notifications
    let unsubNotifications: (() => void) | null = null;
    const notifQ = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );
    unsubNotifications = onSnapshot(notifQ, (notifSnap) => {
      setNotificationCount(notifSnap.size);
    });
    return () => {
      if (unsubConvs) unsubConvs();
      unsubMsgs.forEach(unsub => unsub());
      if (unsubNotifications) unsubNotifications();
    };
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
                  onClick={() => navigate('/community')}
                  aria-label="Community Forum"
                  className="text-muted-foreground hover:text-foreground relative"
                >
                  <Users className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => navigate('/notifications')}
                  className="text-muted-foreground hover:text-foreground relative"
                >
                  <Bell className="h-4 w-4" />
                  {notificationCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] leading-none rounded-full min-w-[14px] h-[14px] px-[3px] flex items-center justify-center">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </div>
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => navigate('/messages')}
                  className="text-muted-foreground hover:text-foreground relative"
                  title="Messages"
                >
                  <MessageSquare className="h-4 w-4" />
                  {messageCount > 0 ? (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] leading-none rounded-full min-w-[14px] h-[14px] px-[3px] flex items-center justify-center">
                      {messageCount > 9 ? '9+' : messageCount}
                    </div>
                  ) : null}
                </Button>
              </>
            )}
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Avatar className="h-8 w-8 cursor-pointer" onClick={() => navigate('/profile')}>
                    <AvatarImage src={user.avatar || user.avatarUrl || user.profile?.avatar_url} />
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