import { Shield, Zap, Globe, Users, Lock, TrendingUp } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Shield,
      title: "Verified Employers",
      description: "All employers must verify with 0.05 BASE, ensuring legitimate job postings and reducing spam."
    },
    {
      icon: Zap,
      title: "Instant Applications",
      description: "Apply to jobs instantly with your Web3 portfolio. No lengthy forms or waiting periods."
    },
    {
      icon: Globe,
      title: "Decentralized Storage",
      description: "Your resumes and portfolios are stored securely on IPFS, giving you full control of your data."
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Built by the community, for the community. Transparent and open-source development."
    },
    {
      icon: Lock,
      title: "Secure & Private",
      description: "Blockchain-based authentication ensures your identity and data remain secure and private."
    },
    {
      icon: TrendingUp,
      title: "Growth Focused",
      description: "Connect with the fastest-growing companies in Web3, DeFi, and blockchain technology."
    }
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-card/50 via-transparent to-card/50"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose <span className="gradient-text">Talent Hire</span>?
          </h2>
          <p className="text-foreground/70 text-lg max-w-3xl mx-auto">
            Experience the future of job searching with blockchain technology, verified employers, 
            and complete control over your professional data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="glass-card p-8 rounded-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary/20 to-primary-glow/20 rounded-xl mb-6 group-hover:from-primary/30 group-hover:to-primary-glow/30 transition-all duration-300">
                <feature.icon className="h-8 w-8 text-primary" />
              </div>
              
              <h3 className="text-xl font-semibold mb-4 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-foreground/70 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;