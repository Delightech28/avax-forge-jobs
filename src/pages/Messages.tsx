import { useState } from "react";
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

const mockConversations: Conversation[] = [
  { id: "1", name: "ArenaApp", lastMessage: "We reviewed your application.", time: "2h", unread: 2 },
  { id: "2", name: "DeFi Protocol Labs", lastMessage: "Can you share availability?", time: "1d", unread: 0 },
  { id: "3", name: "MetaVerse Studios", lastMessage: "Thanks for your interest!", time: "3d", unread: 0 },
];

const mockMessages: Record<string, Message[]> = {
  "1": [
    { id: "m1", sender: "ArenaApp", text: "Hello! We reviewed your application.", time: "09:20" },
    { id: "m2", sender: "You", text: "Thanks! Happy to share more info.", time: "09:22" },
  ],
  "2": [
    { id: "m1", sender: "DeFi Protocol Labs", text: "Can you share availability?", time: "Yesterday" },
  ],
  "3": [
    { id: "m1", sender: "MetaVerse Studios", text: "Thanks for your interest!", time: "Mon" },
  ],
};

const Messages = () => {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string>(mockConversations[0]?.id || "");
  const [composerText, setComposerText] = useState("");

  const conversations = mockConversations.filter(c =>
    !query.trim() || c.name.toLowerCase().includes(query.toLowerCase())
  );

  const activeMessages = mockMessages[activeId] || [];

  const handleSend = () => {
    if (!composerText.trim()) return;
    // For scaffold: push locally
    mockMessages[activeId] = [...activeMessages, { id: String(Date.now()), sender: "You", text: composerText.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }];
    setComposerText("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
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
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="divide-y">
                {conversations.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setActiveId(c.id)}
                    className={`w-full text-left p-3 hover:bg-accent rounded transition ${activeId === c.id ? 'bg-accent' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{c.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate">{c.name}</p>
                          <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{c.time}</span>
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
                    <div key={m.id} className={`flex ${m.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`rounded-lg px-3 py-2 max-w-[80%] ${m.sender === 'You' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <p className="text-sm whitespace-pre-wrap">{m.text}</p>
                        <p className={`text-[10px] mt-1 ${m.sender === 'You' ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{m.time}</p>
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
      </main>
    </div>
  );
};

export default Messages;
