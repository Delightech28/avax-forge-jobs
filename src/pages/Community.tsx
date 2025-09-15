// Format date: remove seconds, show year as '25' instead of '2025'
function formatDate(dateStr: string): string {
  let dateObj: Date | null = null;
  if (dateStr.includes(',')) {
    dateObj = new Date(dateStr);
  } else if (/\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    dateObj = new Date(dateStr);
  }
  if (dateObj && !isNaN(dateObj.getTime())) {
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    const year = dateObj.getFullYear().toString().slice(2);
    let hours = dateObj.getHours();
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    return `${month}/${day}/${year}, ${hours}:${minutes} ${ampm}`;
  }
  return dateStr.replace(/:(\d{2})(?::\d{2})?/, ':$1').replace(/20(\d{2})/, '$1');
}
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Users, MessageCircle } from "@/components/ui/icons";
import { ThumbsUp, MessageSquare } from "lucide-react";
import { useRef } from "react";
import { db } from "@/integrations/firebase/client";
import { collection, addDoc, getDocs, serverTimestamp, query, orderBy } from "firebase/firestore";
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";

// No mockup data

function shuffleArray<T>(array: T[]): T[] {
  // Fisher-Yates shuffle
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

type Reply = {
  author: string;
  text: string;
  createdAt: string;
  avatarUrl?: string;
};

type CommunityPost = {
  id: string;
  author: string;
  userId: string;
  avatar: string;
  content: string;
  createdAt: string;
  likes: number;
  likedBy?: string[];
  replies: Reply[];
};

export const Community = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  // Track liked post IDs for current user (local only)
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [showLikeEmoji, setShowLikeEmoji] = useState<{[key: string]: boolean}>({});
  // Reply state: which post is open, input value, and comments per post
  const [replyOpen, setReplyOpen] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState("");
  // Remove local comments state, use Firestore replies only
  const [newPost, setNewPost] = useState("");
  const [showPostModal, setShowPostModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Shuffle only on initial load
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "community_posts"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const realPosts = snap.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            author: data.author || "Unknown",
            userId: data.userId || "",
            avatar: data.avatar || "",
            content: data.content || "",
            createdAt: data.createdAt
              ? (typeof data.createdAt === "string"
                  ? data.createdAt
                  : data.createdAt.toDate().toLocaleString())
              : "",
            likes: typeof data.likes === "number" ? data.likes : 0,
            likedBy: Array.isArray(data.likedBy) ? data.likedBy : [],
            replies: Array.isArray(data.replies) ? data.replies : [],
          };
        });
        setPosts(shuffleArray(realPosts));
      } catch {
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // Handle posting a new message
  const handlePost = async () => {
    if (!newPost.trim() || !user) return;
    setLoading(true);
    try {
      // Fetch avatar from Firestore user document
      let avatarUrl = "";
      try {
        const userDocRef = (await import("firebase/firestore")).doc(db, "users", user.uid || user.id || "");
        const userDocSnap = await (await import("firebase/firestore")).getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          avatarUrl = userData.avatarUrl || userData.avatar || "";
        } else {
          avatarUrl = "";
        }
      } catch {
        avatarUrl = "";
      }
      await addDoc(collection(db, "community_posts"), {
        author: user.fullName || user.email || "You",
        userId: user.uid || user.id || "",
        avatar: avatarUrl,
        content: newPost,
        createdAt: serverTimestamp(),
        likes: 0,
        replies: [],
      });
      setNewPost("");
      // Refetch posts to show the new one
      const q = query(collection(db, "community_posts"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const realPosts = snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          author: data.author || "Unknown",
          userId: data.userId || "",
          avatar: data.avatar || "",
          content: data.content || "",
          createdAt: data.createdAt
            ? (typeof data.createdAt === "string"
                ? data.createdAt
                : data.createdAt.toDate().toLocaleString())
            : "",
          likes: typeof data.likes === "number" ? data.likes : 0,
          replies: Array.isArray(data.replies) ? data.replies : [],
        };
      });
  setPosts(realPosts);
    } catch (err) {
      // Optionally show error
    } finally {
      setLoading(false);
    }
  };

  // Like/unlike handler
  const handleLike = async (postId: string) => {
    if (!user) return;
    const postRef = doc(db, "community_posts", postId);
    const postSnap = await getDoc(postRef);
    if (!postSnap.exists()) return;
    const data = postSnap.data();
    const likedBy: string[] = Array.isArray(data.likedBy) ? data.likedBy : [];
    const alreadyLiked = likedBy.includes(user.uid || user.id);
    try {
      if (alreadyLiked) {
        await updateDoc(postRef, {
          likes: (data.likes || 1) - 1,
          likedBy: arrayRemove(user.uid || user.id),
        });
        setLikedPosts(prev => prev.filter(id => id !== postId));
      } else {
        await updateDoc(postRef, {
          likes: (data.likes || 0) + 1,
          likedBy: arrayUnion(user.uid || user.id),
        });
        setShowLikeEmoji(e => ({ ...e, [postId]: true }));
        setTimeout(() => {
          setShowLikeEmoji(e => ({ ...e, [postId]: false }));
        }, 700);
        setLikedPosts(prev => [...prev, postId]);
      }
      // Refetch posts to update UI
      const q = query(collection(db, "community_posts"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const realPosts = snap.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          author: data.author || "Unknown",
          userId: data.userId || "",
          avatar: data.avatar || "",
          content: data.content || "",
          createdAt: data.createdAt
            ? (typeof data.createdAt === "string"
                ? data.createdAt
                : data.createdAt.toDate().toLocaleString())
            : "",
          likes: typeof data.likes === "number" ? data.likes : 0,
          likedBy: Array.isArray(data.likedBy) ? data.likedBy : [],
          replies: Array.isArray(data.replies) ? data.replies : [],
        };
      });
  setPosts(realPosts);
    } catch (err) {
      // Optionally show error
    }
  };

  // Handle reply button click
  const handleReplyClick = (postId: string) => {
    setReplyOpen(replyOpen === postId ? null : postId);
    setReplyInput("");
  };

  // Handle reply submit
  const handleReplySubmit = async (postId: string) => {
    if (!replyInput.trim() || !user) return;
    const postRef = doc(db, "community_posts", postId);
    // Fetch avatar from Firestore user document
    let avatarUrl = "";
    try {
      const userDocRef = (await import("firebase/firestore")).doc(db, "users", user.uid || user.id || "");
      const userDocSnap = await (await import("firebase/firestore")).getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        avatarUrl = userData.avatarUrl || userData.avatar || "";
      }
    } catch {
      avatarUrl = "";
    }
    const newReply: Reply = {
      author: user.fullName || user.email || "You",
      text: replyInput,
      createdAt: new Date().toLocaleString(),
      avatarUrl,
    };
    try {
      await updateDoc(postRef, {
        replies: arrayUnion(newReply),
      });
      setReplyInput("");
      // Refetch posts to update UI (no shuffle)
      const q = query(collection(db, "community_posts"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const realPosts = snap.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          author: data.author || "Unknown",
          userId: data.userId || "",
          avatar: data.avatar || "",
          content: data.content || "",
          createdAt: data.createdAt
            ? (typeof data.createdAt === "string"
                ? data.createdAt
                : data.createdAt.toDate().toLocaleString())
            : "",
          likes: typeof data.likes === "number" ? data.likes : 0,
          likedBy: Array.isArray(data.likedBy) ? data.likedBy : [],
          replies: Array.isArray(data.replies) ? data.replies : [],
        };
      });
      setPosts(realPosts);
    } catch (err) {
      // Optionally show error
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Community Forum
            </CardTitle>
            <div className="text-muted-foreground">Connect, share, and learn with other AVAX Forge users.</div>
          </CardHeader>
          <CardContent>
            {/* Removed always-visible post input/button */}
      {/* Floating Plus Button */}
      <button
        className="fixed bottom-6 right-6 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg p-4 flex items-center justify-center z-50"
        style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
        onClick={() => setShowPostModal(true)}
        aria-label="Add Post"
      >
        <Plus className="h-6 w-6" />
      </button>
      {/* Post Modal */}
      <Dialog open={showPostModal} onOpenChange={setShowPostModal}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>New Community Post</DialogTitle>
          </DialogHeader>
          <textarea
            className="w-full border border-primary/30 rounded-lg p-3 mb-2 bg-black text-white placeholder:text-gray-400 shadow focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
            rows={4}
            placeholder="Share your thoughts, questions, or tips with the community..."
            value={newPost}
            onChange={e => setNewPost(e.target.value)}
            disabled={loading}
          />
          <Button onClick={() => { handlePost(); setShowPostModal(false); }} disabled={loading || !newPost.trim()}>
            Post
          </Button>
        </DialogContent>
      </Dialog>
            <div className="space-y-4">
                  {posts.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8 text-lg">No posts yet. Be the first to post in the community!</div>
                  ) : (
                    posts.map(post => {
                      const liked = likedPosts.includes(post.id);
                      return (
                        <Card key={post.id} className="border-primary/20">
                          <div className="flex items-start p-4">
                            <Avatar className="h-8 w-8 mr-3">
                              <AvatarImage src={post.avatar || ""} />
                              <AvatarFallback>{post.author?.charAt(0) || '?'}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col flex-1">
                              <span className="font-semibold text-left">{post.author}</span>
                              <div className="text-foreground/80 mb-2 mt-1">{post.content}</div>
                              <div className="flex justify-between items-center mt-2">
                                <div className="flex gap-4 items-center relative">
                                  <Button
                                    size="sm"
                                    variant={liked ? "default" : "outline"}
                                    className={`flex items-center gap-1 px-2 py-1 ${liked ? 'bg-blue-600 text-white' : ''}`}
                                    onClick={() => handleLike(post.id)}
                                  >
                                    <ThumbsUp className="h-4 w-4" />
                                    <span className="text-xs">{post.likes || 0}</span>
                                  </Button>
                                  {showLikeEmoji[post.id] && (
                                    <span
                                      className="absolute left-10 -top-2 animate-bounce text-2xl select-none pointer-events-none"
                                      style={{ zIndex: 10 }}
                                    >
                                      👍
                                    </span>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex items-center gap-1 px-2 py-1"
                                    onClick={() => handleReplyClick(post.id)}
                                  >
                                    <MessageSquare className="h-4 w-4" />
                                    <span className="text-xs">{post.replies.length}</span>
                                  </Button>
                                </div>
                                <span className="text-xs text-muted-foreground text-right whitespace-nowrap">
                                  {post.createdAt && typeof post.createdAt === 'string' ? formatDate(post.createdAt) : ''}
                                </span>
                              </div>
                              {/* Reply section */}
                              {replyOpen === post.id && (
                                <div className="mt-3 border-t pt-3">
                                  <div className="mb-2">
                                    <input
                                      type="text"
                                      className="w-full border rounded px-2 py-1 text-black"
                                      placeholder="Write a reply..."
                                      value={replyInput}
                                      onChange={e => setReplyInput(e.target.value)}
                                      onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                          handleReplySubmit(post.id);
                                        }
                                      }}
                                    />
                                    <Button
                                      size="sm"
                                      className="ml-2 mt-2"
                                      onClick={() => handleReplySubmit(post.id)}
                                      disabled={!replyInput.trim()}
                                    >
                                      Reply
                                    </Button>
                                  </div>
                                  <div className="space-y-2">
                                    {post.replies.map((comment, idx) => (
                                      <div key={idx} className="flex items-start gap-2">
                                        <Avatar className="h-6 w-6">
                                          <AvatarImage src={comment.avatarUrl || ""} />
                                          <AvatarFallback>{comment.author?.charAt(0) || '?'}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <span className="font-semibold text-xs">{comment.author}</span>{' '}
                                          <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
                                          <div className="text-sm">{comment.text}</div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                    })
                  )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Community;
