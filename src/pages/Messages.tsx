import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Send, MessageSquare, Clock } from "lucide-react";

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
}

interface Message {
  id: string;
  sender: string;
  text: string;
  time: string;
  read: boolean; // Added the 'read' property
  createdAt: Timestamp; // Added the 'createdAt' property
}

import { db } from '@/integrations/firebase/client';
import { useAuth } from '@/hooks/useAuth';
import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp, doc, getDoc, setDoc, updateDoc, onSnapshot, Timestamp } from 'firebase/firestore';

const Messages = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [loading, setLoading] = useState(true);
  const [queryText, setQueryText] = useState("");
  const [activeId, setActiveId] = useState<string>("");
  const [composerText, setComposerText] = useState("");
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  // Store participant info for each conversation
  const [participantInfo, setParticipantInfo] = useState<Record<string, { name: string; avatar?: string }>>({});

  useEffect(() => {
    if (!user) return;
    const params = new URLSearchParams(location.search);
    const toUserId = params.get('to');
    setLoading(true);
    // Real-time listener for conversations
    const convQ = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.id),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(convQ, async (convSnap) => {
      const convList: Conversation[] = convSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conversation));
      setConversations(convList);

      // Fetch participant info for each conversation robustly
      const info: Record<string, { name: string; avatar?: string }> = {};
      await Promise.all(convList.map(async (conv) => {
        const participants = (conv as any).participants || [];
        const otherId = participants.find((pid: string) => pid !== user.id);
        console.log('[DEBUG] Conversation', conv.id, 'participants:', participants, 'otherId:', otherId);
        if (otherId) {
          // Try users, then companies
          let docSnap = await getDoc(doc(db, 'users', otherId));
          let data;
          if (docSnap.exists()) {
            data = docSnap.data();
            console.log('[DEBUG] User doc found for', otherId, data);
          } else {
            docSnap = await getDoc(doc(db, 'companies', otherId));
            if (docSnap.exists()) {
              data = docSnap.data();
              console.log('[DEBUG] Company doc found for', otherId, data);
            } else {
              console.warn('[DEBUG] No user/company doc found for', otherId);
            }
          }
          if (data) {
            // Only use displayName or name, never email
            // If companyName exists and is not empty, use it; otherwise use fullName/displayName/name
            let displayName = (data.companyName && data.companyName.trim() !== '')
              ? data.companyName
              : (data.fullName || data.displayName || data.name || 'Unknown');
            info[conv.id] = {
              name: displayName,
              avatar: data.avatar || data.photoURL || data.profilePicture || undefined
            };
          } else {
            info[conv.id] = { name: 'Unknown', avatar: undefined };
          }
        } else {
          info[conv.id] = { name: 'Unknown', avatar: undefined };
        }
      }));
      console.log('[DEBUG] Final participantInfo:', info);
      setParticipantInfo(info);

      // If ?to= is present, try to find or create a conversation with that user
      if (toUserId && toUserId !== user.id) {
        let found = convList.find(c => Array.isArray((c as any).participants) && (c as any).participants.includes(toUserId));
        if (!found) {
          // Create new conversation doc
          const newConvRef = await addDoc(collection(db, 'conversations'), {
            participants: [user.id, toUserId],
            name: 'Chat',
            lastMessage: '',
            updatedAt: serverTimestamp(),
          });
          found = { id: newConvRef.id, name: 'Chat', lastMessage: '', time: '', unread: 0 };
          setConversations(prev => [found!, ...prev]);
        }
        setActiveId(found.id);
      } else {
        // Do not auto-select any conversation when landing or returning to the page
        setActiveId("");
      }

      // Real-time listeners for messages in each conversation
      const msgObj: Record<string, Message[]> = {};
      const unreadObj: Record<string, number> = {};
      const unsubMessages: Array<() => void> = [];
      for (const conv of convList) {
        const msgQ = query(
          collection(db, 'conversations', conv.id, 'messages'),
          orderBy('createdAt', 'asc')
        );
        const unsub = onSnapshot(msgQ, (msgSnap) => {
          const msgs = msgSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
          setMessages(prev => ({ ...prev, [conv.id]: msgs }));
          unreadObj[conv.id] = msgs.filter(m => m.sender !== user.id && !m.read).length;
          setUnreadCounts(prev => ({ ...prev, [conv.id]: unreadObj[conv.id] }));
        });
        unsubMessages.push(unsub);
      }
      setLoading(false);
      // Cleanup message listeners on unmount
      return () => {
        unsubMessages.forEach(unsub => unsub());
      };
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, location.search]);

  const filteredConversations = conversations.filter(c => {
    const info = participantInfo[c.id];
    const name = info?.name || c.name || '';
    return !queryText.trim() || name.toLowerCase().includes(queryText.toLowerCase());
  });


  const activeMessages = messages[activeId] || [];

  // Mark messages as read when a conversation is opened
  useEffect(() => {
    if (!activeId || !user) return;
    const unreadMsgs = (messages[activeId] || []).filter(m => m.sender !== user.id && !m.read);
    if (unreadMsgs.length === 0) return;
    const updateRead = async () => {
      const batch = [];
      for (const m of unreadMsgs) {
        batch.push(updateDoc(doc(db, 'conversations', activeId, 'messages', m.id), { read: true }));
      }
      await Promise.all(batch);
    };
    updateRead();
  }, [activeId, messages, user]);

  const handleSend = async () => {
    if (!composerText.trim() || !user) return;
    let convId = activeId;
    // If no conversation is active, create one (for ?to=... case)
    if (!convId) {
      const params = new URLSearchParams(location.search);
      const toUserId = params.get('to');
      if (!toUserId || toUserId === user.id) return;
      // Create new conversation
      const newConvRef = await addDoc(collection(db, 'conversations'), {
        participants: [user.id, toUserId],
        name: 'Chat',
        lastMessage: '',
        updatedAt: serverTimestamp(),
      });
      convId = newConvRef.id;
      setActiveId(convId);
    }
    // Add message to Firestore
    try {
      const msgRef = collection(db, 'conversations', convId, 'messages');
      const messageData = {
        sender: user.id,
        text: composerText.trim(),
        createdAt: serverTimestamp(),
        read: false,
      };
      const msgResult = await addDoc(msgRef, messageData);
      console.log('[DEBUG] Message sent', messageData, 'msgId:', msgResult.id);
      // Update conversation lastMessage and updatedAt
      await updateDoc(doc(db, 'conversations', convId), {
        lastMessage: composerText.trim(),
        updatedAt: serverTimestamp(),
      });
      setComposerText("");
      // Optionally, re-fetch messages for the active conversation
    } catch (err) {
      console.error('[DEBUG] Error sending message:', err);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversations List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Messages
                </CardTitle>
                <CardDescription>Chat with companies and candidates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations"
                    value={queryText}
                    onChange={(e) => setQueryText(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="divide-y">
                  {filteredConversations.map(c => {
                    const info = participantInfo[c.id] || { name: c.name, avatar: undefined };
                    // Find last message time
                    const msgs = messages[c.id] || [];
                    const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : undefined;
                    let lastTime = '';
                    if (lastMsg && lastMsg.createdAt) {
                      // Firestore Timestamp or Date
                      const ts = (lastMsg.createdAt.seconds)
                        ? new Date(lastMsg.createdAt.seconds * 1000)
                        : lastMsg.createdAt.toDate();
                      lastTime = ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    }
                    return (
                      <button
                        key={c.id}
                        onClick={() => setActiveId(c.id)}
                        className={`w-full text-left p-3 hover:bg-accent rounded transition ${activeId === c.id ? 'bg-accent' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            {info.avatar ? (
                              <img src={info.avatar} alt={info.name} className="h-8 w-8 rounded-full object-cover" />
                            ) : (
                              <AvatarFallback>{info.name && info.name !== 'Unknown' ? info.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0,2) : '?'}</AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium truncate">{info.name}</p>
                              <span className="text-xs text-muted-foreground ml-2">{lastTime}</span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{c.lastMessage}</p>
                          </div>
                          {unreadCounts[c.id] > 0 && (
                            <Badge variant="secondary" className="ml-auto">{unreadCounts[c.id]}</Badge>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Thread View */}
            <Card className="lg:col-span-2">
              {activeId ? (
                <>
                  <CardHeader>
                    <CardTitle>Conversation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3 max-h-[60vh] overflow-auto pr-2">
                      {activeMessages.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No messages yet.</p>
                      ) : (
                        activeMessages.map(m => (
                          <div key={m.id} className={`flex ${m.sender === user?.id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`rounded-lg px-3 py-2 max-w-[80%] ${m.sender === user?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                              <p className="text-sm whitespace-pre-wrap">{m.text}</p>
                              {/* Optionally show time */}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {/* Composer or verification required message */}
                    {user?.verified && user.verified !== 'Basic' ? (
                      <div className="flex items-center gap-2">
                        <Textarea
                          value={composerText}
                          onChange={(e) => setComposerText(e.target.value)}
                          placeholder="Type your message..."
                          rows={2}
                          className="resize-none"
                        />
                        <Button onClick={handleSend} className="h-10" title="Send">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center text-sm text-red-500 font-medium py-4">
                        You need to verify your account to send messages.
                      </div>
                    )}
                  </CardContent>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-24">
                  <MessageSquare className="h-10 w-10 mb-4 text-muted-foreground" />
                  <p className="text-lg text-muted-foreground">Select a conversation or click <b>Send Message</b> on a user profile to start chatting.</p>
                </div>
              )}
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
export default Messages;
