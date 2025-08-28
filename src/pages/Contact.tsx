import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, MapPin, MessageCircle, Clock, Send, Users, Globe } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-slide-up">
            <MessageCircle className="h-4 w-4 text-primary mr-2" />
            <span className="text-sm font-medium">Contact Us</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Get in <span className="gradient-text">Touch</span>
          </h1>
          
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.4s' }}>
            Have questions, feedback, or need support? We're here to help! 
            Reach out to our team and we'll get back to you as soon as possible.
          </p>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="glass-card border-primary/20 text-center hover:border-primary/40 transition-all duration-300 hover:shadow-xl">
            <CardHeader>
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Email Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/70 mb-3">
                Get help via email within 24 hours
              </p>
              <p className="text-primary font-semibold">
                support@avaxforgejobs.com
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-primary/20 text-center hover:border-primary/40 transition-all duration-300 hover:shadow-xl">
            <CardHeader>
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/70 mb-3">
                We aim to respond to all inquiries quickly
              </p>
              <p className="text-primary font-semibold">
                Within 24 hours
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-primary/20 text-center hover:border-primary/40 transition-all duration-300 hover:shadow-xl">
            <CardHeader>
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Global Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/70 mb-3">
                Available worldwide, 24/7
              </p>
              <p className="text-primary font-semibold">
                Always Online
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form & Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <Send className="h-6 w-6 text-primary" />
                Send us a Message
              </CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium text-foreground">
                    First Name *
                  </label>
                  <Input
                    id="firstName"
                    placeholder="Enter your first name"
                    className="border-primary/30 focus:border-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium text-foreground">
                    Last Name *
                  </label>
                  <Input
                    id="lastName"
                    placeholder="Enter your last name"
                    className="border-primary/30 focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email Address *
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  className="border-primary/30 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium text-foreground">
                  Subject *
                </label>
                <Select>
                  <SelectTrigger className="border-primary/30 focus:border-primary">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Inquiry</SelectItem>
                    <SelectItem value="support">Technical Support</SelectItem>
                    <SelectItem value="billing">Billing & Payments</SelectItem>
                    <SelectItem value="partnership">Partnership & Business</SelectItem>
                    <SelectItem value="feedback">Feedback & Suggestions</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-foreground">
                  Message *
                </label>
                <Textarea
                  id="message"
                  placeholder="Tell us how we can help you..."
                  rows={6}
                  className="border-primary/30 focus:border-primary resize-none"
                />
              </div>

              <Button className="w-full bg-primary hover:bg-primary/90 transition-colors">
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </CardContent>
          </Card>

          {/* Contact Information & FAQ */}
          <div className="space-y-8">
            {/* Office Information */}
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  Office Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium text-foreground">Headquarters</p>
                    <p className="text-foreground/70 text-sm">
                      Web3 Innovation District<br />
                      Blockchain Valley, CA 94105<br />
                      United States
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium text-foreground">Email Addresses</p>
                    <p className="text-foreground/70 text-sm">
                      General: hello@avaxforgejobs.com<br />
                      Support: support@avaxforgejobs.com<br />
                      Business: business@avaxforgejobs.com
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium text-foreground">Business Hours</p>
                    <p className="text-foreground/70 text-sm">
                      Monday - Friday: 9:00 AM - 6:00 PM PST<br />
                      Saturday: 10:00 AM - 4:00 PM PST<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Help */}
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  Quick Help
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer">
                    <span className="text-sm font-medium">Help Center</span>
                    <span className="text-primary text-xs">→</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer">
                    <span className="text-sm font-medium">FAQ</span>
                    <span className="text-primary text-xs">→</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer">
                    <span className="text-sm font-medium">Community Forum</span>
                    <span className="text-primary text-xs">→</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer">
                    <span className="text-sm font-medium">Live Chat</span>
                    <span className="text-primary text-xs">→</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Response Times */}
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle className="text-xl">Response Times</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground/70">General Inquiries</span>
                  <span className="text-sm font-medium text-primary">24 hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground/70">Technical Support</span>
                  <span className="text-sm font-medium text-primary">4-8 hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground/70">Urgent Issues</span>
                  <span className="text-sm font-medium text-primary">2-4 hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground/70">Business Inquiries</span>
                  <span className="text-sm font-medium text-primary">48 hours</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Support Options */}
        <div className="mt-20 text-center">
          <Card className="glass-card border-primary/30 bg-gradient-to-r from-primary/5 to-primary-glow/5">
            <CardContent className="pt-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">
                Need More Help?
              </h3>
              <p className="text-foreground/70 mb-6 max-w-2xl mx-auto">
                Can't find what you're looking for? We offer multiple support channels 
                to ensure you get the help you need quickly and efficiently.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                  Join Community
                </button>
                <button className="px-6 py-3 border border-primary/30 text-foreground rounded-md hover:bg-primary/10 transition-colors">
                  Schedule Call
                </button>
                <button className="px-6 py-3 border border-primary/30 text-foreground rounded-md hover:bg-primary/10 transition-colors">
                  View Documentation
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Contact;
