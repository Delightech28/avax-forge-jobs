import { Button } from "@/components/ui/button";
import { Search, TrendingUp, Shield, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleBrowseJobs = () => {
    navigate('/jobs');
  };

  const handlePostJob = () => {
    if (user) {
      navigate('/post-job');
    } else {
      navigate('/auth');
    }
  };

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary-glow/5"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-glow/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-slide-up">
            <Shield className="h-4 w-4 text-primary mr-2" />
            <span className="text-sm font-medium">Powered by Avalanche Blockchain</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            The Future of{" "}
            <span className="gradient-text">Web3 Jobs</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-foreground/80 mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.4s' }}>
            Connect with verified employers and discover opportunities in the decentralized world. 
            Secure, transparent, and built on Avalanche.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <Button variant="hero" size="lg" className="text-lg px-8 py-6" onClick={handleBrowseJobs}>
              <Search className="h-5 w-5 mr-2" />
              Browse Jobs
            </Button>
            <Button variant="gradient" size="lg" className="text-lg px-8 py-6" onClick={handlePostJob}>
              <TrendingUp className="h-5 w-5 mr-2" />
              Post a Job
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.8s' }}>
            <div className="glass-card p-6 rounded-xl">
              <div className="flex items-center justify-center mb-3">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <div className="text-3xl font-bold gradient-text mb-2">500+</div>
              <div className="text-foreground/60">Active Jobs</div>
            </div>
            <div className="glass-card p-6 rounded-xl">
              <div className="flex items-center justify-center mb-3">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <div className="text-3xl font-bold gradient-text mb-2">100+</div>
              <div className="text-foreground/60">Verified Companies</div>
            </div>
            <div className="glass-card p-6 rounded-xl">
              <div className="flex items-center justify-center mb-3">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <div className="text-3xl font-bold gradient-text mb-2">$2M+</div>
              <div className="text-foreground/60">Total Salaries</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;