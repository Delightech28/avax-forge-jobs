import { useMemo, useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, ArrowRight, BookOpen, TrendingUp } from "lucide-react";
import { db } from "@/integrations/firebase/client";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";

const Blog = () => {
  const blogPosts = useMemo(() => [
    {
      id: 1,
      title: "The Future of Web3 Employment: Trends to Watch in 2024",
      excerpt: "Discover the latest trends shaping the Web3 job market and how blockchain technology is revolutionizing traditional employment.",
      author: "Talent Hire Team",
      date: "January 15, 2024",
      category: "Industry Trends",
      readTime: "5 min read",
      featured: true
    },
    {
      id: 2,
      title: "How to Build a Strong Web3 Developer Portfolio",
      excerpt: "Learn the essential skills and projects that will make your Web3 developer portfolio stand out in the competitive blockchain job market.",
      author: "Sarah Chen",
      date: "January 12, 2024",
      category: "Career Tips",
      readTime: "7 min read",
      featured: false
    },
    {
      id: 3,
      title: "Smart Contract Security: Best Practices for Developers",
      excerpt: "Essential security practices every smart contract developer should follow to build safe and reliable blockchain applications.",
      author: "Michael Rodriguez",
      date: "January 10, 2024",
      category: "Development",
      readTime: "8 min read",
      featured: false
    },
    {
      id: 4,
      title: "DeFi Protocol Jobs: Opportunities in Decentralized Finance",
      excerpt: "Explore the growing job market in DeFi and the skills needed to succeed in this rapidly evolving sector.",
      author: "Emma Thompson",
      date: "January 8, 2024",
      category: "DeFi",
      readTime: "6 min read",
      featured: false
    },
    {
      id: 5,
      title: "Remote Work in Web3: Building Global Teams",
      excerpt: "How blockchain companies are leveraging remote work to build diverse, global teams and the tools that make it possible.",
      author: "David Kim",
      date: "January 5, 2024",
      category: "Remote Work",
      readTime: "4 min read",
      featured: false
    },
    {
      id: 6,
  title: "Base Ecosystem: Job Opportunities and Growth",
  excerpt: "An overview of the Base blockchain ecosystem and the job opportunities available for developers and professionals.",
      author: "Talent Hire Team",
      date: "January 3, 2024",
  category: "Base",
      readTime: "6 min read",
      featured: false
    }
  ], []);

  const categories = ["All", "Industry Trends", "Career Tips", "Development", "DeFi", "Remote Work", "Base"];
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [email, setEmail] = useState<string>("");

  const visiblePosts = useMemo(() => {
    if (activeCategory === "All") return blogPosts;
    return blogPosts.filter(p => p.category === activeCategory);
  }, [activeCategory, blogPosts]);

  const handleSubscribe = async () => {
    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      toast.error("Please enter a valid email address");
      return;
    }
    try {
      await addDoc(collection(db, "subscribed_users"), {
        email: trimmed,
        createdAt: serverTimestamp(),
      });
      toast.success("Subscribed successfully!");
      setEmail("");
    } catch (e) {
      console.error("Subscribe error", e);
      toast.error("Subscription failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-slide-up">
            <BookOpen className="h-4 w-4 text-primary mr-2" />
            <span className="text-sm font-medium">AVAX Forge Blog</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Insights & <span className="gradient-text">Knowledge</span>
          </h1>
          
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.4s' }}>
            Stay updated with the latest trends, tips, and insights from the Web3 employment world. 
            From career advice to industry analysis, we've got you covered.
          </p>
        </div>

        {/* Featured Post */}
        {visiblePosts.filter(post => post.featured).map(post => (
          <Card key={post.id} className="glass-card border-primary/30 bg-gradient-to-r from-primary/5 to-primary-glow/5 mb-16">
            <CardHeader>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                  {post.category}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Featured
                </Badge>
              </div>
              <CardTitle className="text-3xl md:text-4xl leading-tight">
                {post.title}
              </CardTitle>
              <CardDescription className="text-lg text-foreground/70">
                {post.excerpt}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-foreground/60 mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {post.author}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {post.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    {post.readTime}
                  </div>
                </div>
              </div>
              <button className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
                Read Full Article
                <ArrowRight className="h-4 w-4" />
              </button>
            </CardContent>
          </Card>
        ))}

        {/* Categories */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full border transition-colors ${
                  category === activeCategory 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "border-primary/30 text-foreground/70 hover:bg-primary/10 hover:border-primary/50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visiblePosts.filter(post => !post.featured).map((post) => (
            <Card key={post.id} className="glass-card border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-xl group">
              <CardHeader>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 text-xs">
                    {post.category}
                  </Badge>
                </div>
                <CardTitle className="text-xl leading-tight group-hover:text-primary transition-colors">
                  {post.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/70 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-sm text-foreground/60 mb-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {post.author}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {post.date}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-foreground/50">{post.readTime}</span>
                  <button className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors text-sm">
                    Read More
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-20 text-center">
          <Card className="glass-card border-primary/30 bg-gradient-to-r from-primary/5 to-primary-glow/5">
            <CardContent className="pt-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">
                Stay Updated with Web3 Trends
              </h3>
              <p className="text-foreground/70 mb-6 max-w-2xl mx-auto">
                Get the latest insights, job opportunities, and industry news delivered 
                directly to your inbox. Never miss out on important Web3 developments.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-background border border-primary/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button onClick={handleSubscribe} className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                  Subscribe
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Blog;
