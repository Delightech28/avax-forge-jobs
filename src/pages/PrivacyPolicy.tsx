import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Eye, Lock, Database, Users, Globe, FileText } from "lucide-react";

const PrivacyPolicy = () => {
  const lastUpdated = "January 15, 2024";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-slide-up">
            <Shield className="h-4 w-4 text-primary mr-2" />
            <span className="text-sm font-medium">Privacy Policy</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Your <span className="gradient-text">Privacy</span> Matters
          </h1>
          
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.4s' }}>
            We're committed to protecting your personal information and being transparent 
            about how we collect, use, and safeguard your data.
          </p>
          
          <div className="mt-8 text-sm text-foreground/60">
            Last updated: {lastUpdated}
          </div>
        </div>

        {/* Overview */}
        <Card className="glass-card border-primary/20 mb-12">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <Eye className="h-6 w-6 text-primary" />
              Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/80 leading-relaxed mb-4">
              This Privacy Policy describes how Talent Hire ("we," "us," or "our") collects, 
              uses, and protects your personal information when you use our platform. By using 
              our services, you agree to the collection and use of information in accordance with this policy.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              We are committed to ensuring that your privacy is protected. Should we ask you to provide 
              certain information by which you can be identified when using this platform, then you can 
              be assured that it will only be used in accordance with this privacy statement.
            </p>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <Card className="glass-card border-primary/20 mb-12">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <Database className="h-6 w-6 text-primary" />
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3 text-foreground">Personal Information</h4>
              <ul className="list-disc list-inside space-y-2 text-foreground/70">
                <li>Name and contact information (email address)</li>
                <li>Professional information (skills, experience, portfolio)</li>
                <li>Wallet addresses (when connecting blockchain wallets)</li>
                <li>Profile pictures and biographical information</li>
                <li>Communication preferences and settings</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3 text-foreground">Usage Information</h4>
              <ul className="list-disc list-inside space-y-2 text-foreground/70">
                <li>Job search queries and preferences</li>
                <li>Application history and interactions</li>
                <li>Platform usage patterns and analytics</li>
                <li>Device information and browser data</li>
                <li>IP addresses and location data</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3 text-foreground">Blockchain Data</h4>
              <ul className="list-disc list-inside space-y-2 text-foreground/70">
                <li>Transaction history related to job payments</li>
                <li>Smart contract interactions</li>
                <li>Wallet connection status and preferences</li>
                <li>Token compensation preferences</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Information */}
        <Card className="glass-card border-primary/20 mb-12">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <Users className="h-6 w-6 text-primary" />
              How We Use Your Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-lg mb-3 text-foreground">For Job Seekers</h4>
                  <ul className="list-disc list-inside space-y-2 text-foreground/70 text-sm">
                    <li>Match you with relevant job opportunities</li>
                    <li>Process job applications and communications</li>
                    <li>Provide personalized job recommendations</li>
                    <li>Facilitate payment processing</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-lg mb-3 text-foreground">For Employers</h4>
                  <ul className="list-disc list-inside space-y-2 text-foreground/70 text-sm">
                    <li>Verify company information and credentials</li>
                    <li>Process job postings and applications</li>
                    <li>Facilitate candidate communication</li>
                    <li>Provide analytics and insights</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-semibold text-lg mb-3 text-foreground">General Platform Use</h4>
                <ul className="list-disc list-inside space-y-2 text-foreground/70">
                  <li>Improve our services and user experience</li>
                  <li>Provide customer support and respond to inquiries</li>
                  <li>Send important updates and notifications</li>
                  <li>Ensure platform security and prevent fraud</li>
                  <li>Comply with legal obligations and regulations</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Protection */}
        <Card className="glass-card border-primary/20 mb-12">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <Lock className="h-6 w-6 text-primary" />
              Data Protection & Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-foreground/80 leading-relaxed">
                We implement appropriate security measures to protect your personal information against 
                unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              
              <ul className="list-disc list-inside space-y-2 text-foreground/70">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Secure hosting infrastructure and data centers</li>
                <li>Employee training on data protection practices</li>
                <li>Incident response and breach notification procedures</li>
              </ul>
              
              <p className="text-foreground/80 leading-relaxed mt-4">
                While we strive to protect your personal information, no method of transmission over 
                the internet or electronic storage is 100% secure. We cannot guarantee absolute security, 
                but we are committed to maintaining the highest standards of data protection.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data Sharing */}
        <Card className="glass-card border-primary/20 mb-12">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <Globe className="h-6 w-6 text-primary" />
              Data Sharing & Third Parties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-foreground/80 leading-relaxed">
                We do not sell, trade, or otherwise transfer your personal information to third parties 
                without your consent, except in the following circumstances:
              </p>
              
              <ul className="list-disc list-inside space-y-2 text-foreground/70">
                <li><strong>Service Providers:</strong> We may share data with trusted third-party service providers who assist us in operating our platform</li>
                <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights and safety</li>
                <li><strong>Business Transfers:</strong> In the event of a merger or acquisition, your information may be transferred</li>
                <li><strong>Consent:</strong> We may share information with your explicit consent</li>
              </ul>
              
              <p className="text-foreground/80 leading-relaxed mt-4">
                All third-party service providers are contractually obligated to protect your information 
                and use it only for the purposes specified in our agreements.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className="glass-card border-primary/20 mb-12">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary" />
              Your Rights & Choices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-foreground/80 leading-relaxed">
                You have certain rights regarding your personal information, including:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-lg mb-3 text-foreground">Access & Control</h4>
                  <ul className="list-disc list-inside space-y-2 text-foreground/70 text-sm">
                    <li>Access your personal information</li>
                    <li>Update or correct your data</li>
                    <li>Delete your account and data</li>
                    <li>Export your data</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-lg mb-3 text-foreground">Communication Preferences</h4>
                  <ul className="list-disc list-inside space-y-2 text-foreground/70 text-sm">
                    <li>Opt out of marketing communications</li>
                    <li>Control notification settings</li>
                    <li>Manage email preferences</li>
                    <li>Set privacy controls</li>
                  </ul>
                </div>
              </div>
              
              <p className="text-foreground/80 leading-relaxed mt-4">
                To exercise these rights, please contact us using the information provided below. 
                We will respond to your request within 30 days.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="glass-card border-primary/30 bg-gradient-to-r from-primary/5 to-primary-glow/5">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Contact Us</CardTitle>
            <CardDescription className="text-center">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-4">
              <p className="text-foreground/80">
                <strong>Email:</strong> privacy@avaxforgejobs.com
              </p>
              <p className="text-foreground/80">
                <strong>Address:</strong> Talent Hire Privacy Team
              </p>
              <p className="text-foreground/80">
                <strong>Response Time:</strong> We aim to respond to all privacy-related inquiries within 48 hours
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
