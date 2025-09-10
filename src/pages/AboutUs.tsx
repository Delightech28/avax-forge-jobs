import React from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, Users, Globe, Target, Award, Save } from "lucide-react";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-slide-up">
            <Shield className="h-4 w-4 text-primary mr-2" />
            <span className="text-sm font-medium">About AVAX Forge Jobs</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Building the Future of{" "}
            <span className="gradient-text">Web3 Employment</span>
          </h1>
          
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.4s' }}>
            We're revolutionizing how talent connects with opportunities in the decentralized world. 
            Built on Avalanche blockchain, we provide secure, transparent, and efficient job matching.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Target className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl">Our Mission</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/80 text-lg leading-relaxed">
                To democratize access to Web3 opportunities by creating a transparent, 
                secure, and efficient platform that connects global talent with innovative 
                blockchain companies.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Globe className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl">Our Vision</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/80 text-lg leading-relaxed">
                A world where anyone, anywhere can access meaningful work in the 
                decentralized economy, with fair compensation and transparent processes 
                powered by blockchain technology.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            Our <span className="gradient-text">Core Values</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-card text-center border-primary/20">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Security First</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/70">
                  Built on Avalanche blockchain for maximum security and transparency
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card text-center border-primary/20">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Community Driven</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/70">
                  Empowering both job seekers and employers in the Web3 ecosystem
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card text-center border-primary/20">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Innovation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/70">
                  Leveraging cutting-edge technology to solve real-world problems
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            Platform <span className="gradient-text">Statistics</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="glass-card text-center border-primary/20">
              <CardContent className="pt-6">
                <div className="text-4xl font-bold gradient-text mb-2">500+</div>
                <p className="text-foreground/70">Active Jobs</p>
              </CardContent>
            </Card>

            <Card className="glass-card text-center border-primary/20">
              <CardContent className="pt-6">
                <div className="text-4xl font-bold gradient-text mb-2">100+</div>
                <p className="text-foreground/70">Verified Companies</p>
              </CardContent>
            </Card>

            <Card className="glass-card text-center border-primary/20">
              <CardContent className="pt-6">
                <div className="text-4xl font-bold gradient-text mb-2">50+</div>
                <p className="text-foreground/70">Countries</p>
              </CardContent>
            </Card>

            <Card className="glass-card text-center border-primary/20">
              <CardContent className="pt-6">
                <div className="text-4xl font-bold gradient-text mb-2">$2M+</div>
                <p className="text-foreground/70">Total Salaries</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Team */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            Meet Our <span className="gradient-text">Team</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="glass-card text-center border-primary/20">
              <CardHeader>
                <div className="w-24 h-24 bg-gradient-to-r from-primary/20 to-primary-glow/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-12 w-12 text-primary" />
                </div>
                <CardTitle>Development Team</CardTitle>
                <CardDescription>
                  Building the future of Web3 employment
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card text-center border-primary/20">
              <CardHeader>
                <div className="w-24 h-24 bg-gradient-to-r from-primary/20 to-primary-glow/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Award className="h-12 w-12 text-primary" />
                </div>
                <CardTitle>Quality Assurance</CardTitle>
                <CardDescription>
                  Ensuring platform reliability and security
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card text-center border-primary/20">
              <CardHeader>
                <div className="w-24 h-24 bg-gradient-to-r from-primary/20 to-primary-glow/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Globe className="h-12 w-12 text-primary" />
                </div>
                <CardTitle>Community Team</CardTitle>
                <CardDescription>
                  Growing the Web3 ecosystem
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Card className="glass-card border-primary/30 bg-gradient-to-r from-primary/5 to-primary-glow/5">
            <CardContent className="pt-8">
              <h3 className="text-2xl font-bold mb-4">
                Ready to Join the Future?
              </h3>
              <p className="text-foreground/70 mb-6 max-w-2xl mx-auto">
                Whether you're looking for your next Web3 opportunity or seeking top talent 
                for your blockchain project, AVAX Forge Jobs is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/jobs" 
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Browse Jobs
                </a>
                <a 
                  href="/auth" 
                  className="inline-flex items-center justify-center px-6 py-3 border border-primary/30 text-foreground rounded-md hover:bg-primary/10 transition-colors"
                >
                  Get Started
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AboutUs;