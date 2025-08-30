import { useEffect, useState } from 'react';
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle, XCircle, AlertTriangle, Info, Clock, Settings } from "lucide-react";
import { db } from '@/integrations/firebase/client';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';

type NotificationPrefs = {
  email: {
    application: boolean;
    matches: boolean;
    updates: boolean;
    marketing: boolean;
  };
  push: {
    status: boolean;
    messages: boolean;
    recommendations: boolean;
    reminders: boolean;
  };
};

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
        const q = query(
          collection(db, 'notifications'),
          where('userId', '==', user.id),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      // Assume notifications are fetched and set here
      // setNotifications(...);
    } catch (e) {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };
    fetchNotifications();
  }, [user]);

  const [filter, setFilter] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [prefs, setPrefs] = useState({
    email: { application: true, matches: true, updates: true, marketing: false },
    push: { status: true, messages: true, recommendations: false, reminders: false },
  });

  // Persist unread count to localStorage for the header badge
  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('unreadCount', String(count));
    }
  }, [notifications]);

  // Basic unread reset when window gains focus
  useEffect(() => {
    const onFocus = () => {
      // Optionally, you could refresh notifications here if needed
      // For now, just a placeholder
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  // Load and save preferences from/to Firestore
  useEffect(() => {
    const loadPrefs = async () => {
      if (!user) return;
      try {
        const ref = doc(db, 'notification_settings', user.id as string);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data() as NotificationPrefs;
          setPrefs(prev => ({ ...prev, ...data }));
        }
      } catch (_) {
        // Intentionally left blank: ignore errors when loading preferences
      }
    };
    loadPrefs();
  }, [user]);

  const savePreferences = async () => {
    if (!user) return;
    try {
      const ref = doc(db, 'notification_settings', user.id as string);
      await setDoc(ref, prefs, { merge: true });
    } catch (_) {
      // Intentionally left blank: ignore errors when saving preferences
    }
  };

  const getNotificationTypeStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-500/30 bg-green-500/5';
      case 'warning':
        return 'border-yellow-500/30 bg-yellow-500/5';
      case 'error':
        return 'border-red-500/30 bg-red-500/5';
      case 'info':
        return 'border-blue-500/30 bg-blue-500/5';
      default:
        return 'border-primary/30 bg-primary/5';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-primary" />;
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Removed delete per requirements

  const filteredNotifications = notifications.filter(notification => {
    if (showUnreadOnly && notification.read) return false;
    if (filter !== 'all' && notification.category !== filter) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Notifications
            </h1>
            <p className="text-foreground/70">
              Stay updated with your job applications, matches, and platform updates
            </p>
          </div>
          
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
              {unreadCount} unread
            </Badge>
            <Button 
              variant="outline" 
              size="sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              Mark all as read
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="glass-card border-primary/20 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-full border transition-colors ${
                    filter === 'all' 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'border-primary/30 text-foreground/70 hover:bg-primary/10 hover:border-primary/50'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('application')}
                  className={`px-4 py-2 rounded-full border transition-colors ${
                    filter === 'application' 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'border-primary/30 text-foreground/70 hover:bg-primary/10 hover:border-primary/50'
                  }`}
                >
                  Applications
                </button>
                <button
                  onClick={() => setFilter('job_match')}
                  className={`px-4 py-2 rounded-full border transition-colors ${
                    filter === 'job_match' 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'border-primary/30 text-foreground/70 hover:bg-primary/10 hover:border-primary/50'
                  }`}
                >
                  Job Matches
                </button>
                <button
                  onClick={() => setFilter('reminder')}
                  className={`px-4 py-2 rounded-full border transition-colors ${
                    filter === 'reminder' 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'border-primary/30 text-foreground/70 hover:bg-primary/10 hover:border-primary/50'
                  }`}
                >
                  Reminders
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="unreadOnly"
                  checked={showUnreadOnly}
                  onChange={(e) => setShowUnreadOnly(e.target.checked)}
                  className="rounded border-primary/30 text-primary focus:ring-primary"
                />
                <label htmlFor="unreadOnly" className="text-sm text-foreground/70">
                  Show unread only
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card className="glass-card border-primary/20 text-center py-12">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No notifications</h3>
              <p className="text-foreground/70">
                {showUnreadOnly 
                  ? "You're all caught up! No unread notifications."
                  : "No notifications match your current filters."
                }
              </p>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`glass-card border-primary/20 transition-all duration-300 hover:shadow-lg ${
                  !notification.read ? 'ring-2 ring-primary/20' : ''
                } ${getNotificationTypeStyles(notification.type)}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        notification.read ? 'bg-foreground/10' : 'bg-primary/20'
                      }`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-semibold text-lg ${
                            notification.read ? 'text-foreground/70' : 'text-foreground'
                          }`}>
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <Badge variant="secondary" className="bg-primary text-primary-foreground text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-foreground/50 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {notification.timestamp}
                          </span>
                        </div>
                      </div>
                      
                      <p className={`text-foreground/80 mb-4 ${
                        notification.read ? 'text-foreground/60' : ''
                      }`}>
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center gap-3">
                        {!notification.read && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="border-primary/30 text-primary hover:bg-primary/10"
                          >
                            Mark as read
                          </Button>
                        )}
                        
                        {/* Delete action removed */}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Notification Settings */}
        <div className="mt-16">
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-3">
                <Settings className="h-5 w-5 text-primary" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Customize how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Email Notifications</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={prefs.email.application} onChange={(e)=>setPrefs(p=>({...p,email:{...p.email,application:e.target.checked}}))} className="rounded border-primary/30 text-primary focus:ring-primary" />
                      <span className="text-sm text-foreground/70">Job application updates</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={prefs.email.matches} onChange={(e)=>setPrefs(p=>({...p,email:{...p.email,matches:e.target.checked}}))} className="rounded border-primary/30 text-primary focus:ring-primary" />
                      <span className="text-sm text-foreground/70">New job matches</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={prefs.email.updates} onChange={(e)=>setPrefs(p=>({...p,email:{...p.email,updates:e.target.checked}}))} className="rounded border-primary/30 text-primary focus:ring-primary" />
                      <span className="text-sm text-foreground/70">Platform updates</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={prefs.email.marketing} onChange={(e)=>setPrefs(p=>({...p,email:{...p.email,marketing:e.target.checked}}))} className="rounded border-primary/30 text-primary focus:ring-primary" />
                      <span className="text-sm text-foreground/70">Marketing emails</span>
                    </label>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Push Notifications</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={prefs.push.status} onChange={(e)=>setPrefs(p=>({...p,push:{...p.push,status:e.target.checked}}))} className="rounded border-primary/30 text-primary focus:ring-primary" />
                      <span className="text-sm text-foreground/70">Application status changes</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={prefs.push.messages} onChange={(e)=>setPrefs(p=>({...p,push:{...p.push,messages:e.target.checked}}))} className="rounded border-primary/30 text-primary focus:ring-primary" />
                      <span className="text-sm text-foreground/70">New messages</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={prefs.push.recommendations} onChange={(e)=>setPrefs(p=>({...p,push:{...p.push,recommendations:e.target.checked}}))} className="rounded border-primary/30 text-primary focus:ring-primary" />
                      <span className="text-sm text-foreground/70">Job recommendations</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={prefs.push.reminders} onChange={(e)=>setPrefs(p=>({...p,push:{...p.push,reminders:e.target.checked}}))} className="rounded border-primary/30 text-primary focus:ring-primary" />
                      <span className="text-sm text-foreground/70">Reminders</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-primary/20">
                <Button onClick={savePreferences} className="bg-primary hover:bg-primary/90 transition-colors">
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Notifications;
