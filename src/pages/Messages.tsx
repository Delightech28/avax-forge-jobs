import { useState, useEffect } from "react";
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
}

import { db } from '@/integrations/firebase/client';
import { useAuth } from '@/hooks/useAuth';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [loading, setLoading] = useState(true);
  const [queryText, setQueryText] = useState("");
  const [activeId, setActiveId] = useState<string>("");
  const [composerText, setComposerText] = useState("");

  useEffect(() => {
    if (!user) return;
    const fetchConversations = async () => {
      setLoading(true);
      try {
        const convQ = query(
          collection(db, 'conversations'),
          where('participants', 'array-contains', user.id),
          orderBy('updatedAt', 'desc')
        );
        const convSnap = await getDocs(convQ);
        const convList: Conversation[] = convSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conversation));
        setConversations(convList);
        if (convList.length > 0) setActiveId(convList[0].id);

        // Fetch messages for each conversation
        const msgObj: Record<string, Message[]> = {};
        for (const conv of convList) {
          const msgQ = query(
            collection(db, 'conversations', conv.id, 'messages'),
            orderBy('createdAt', 'asc')
          );
          const msgSnap = await getDocs(msgQ);
          msgObj[conv.id] = msgSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
        }
        setMessages(msgObj);
      } catch {
        setConversations([]);
        setMessages({});
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [user]);

  const filteredConversations = conversations.filter(c =>
    !queryText.trim() || c.name.toLowerCase().includes(queryText.toLowerCase())
  );

  const activeMessages = messages[activeId] || [];

  const handleSend = async () => {
    if (!composerText.trim() || !user || !activeId) return;
    // Add message to Firestore
    try {
      const msgRef = collection(db, 'conversations', activeId, 'messages');
      await import('firebase/firestore').then(async ({ addDoc, serverTimestamp }) => {
        await addDoc(msgRef, {
          sender: user.id,
          text: composerText.trim(),
          createdAt: serverTimestamp(),
        });
      });
      setComposerText("");
      // Optionally, re-fetch messages for the active conversation
      // ...
    } catch {
      // Intentionally ignore errors for now
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
                  {filteredConversations.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setActiveId(c.id)}
                      className={`w-full text-left p-3 hover:bg-accent rounded transition ${activeId === c.id ? 'bg-accent' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{c.name?.charAt(0) || '?'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">{c.name}</p>
                            {/* Optionally show last message time */}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{c.lastMessage}</p>
                        </div>
                        {c.unread > 0 && (
                          <Badge variant="secondary" className="ml-auto">{c.unread}</Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Thread View */}
            <Card className="lg:col-span-2">
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

                {/* Composer */}
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
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
export default Messages;
