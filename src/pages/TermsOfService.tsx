import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Shield, Users, Briefcase, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

const TermsOfService = () => {
  const lastUpdated = "January 15, 2024";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-slide-up">
            <FileText className="h-4 w-4 text-primary mr-2" />
            <span className="text-sm font-medium">Terms of Service</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Terms of <span className="gradient-text">Service</span>
          </h1>
          
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.4s' }}>
            Please read these terms carefully before using Talent Hire. 
            By using our platform, you agree to be bound by these terms and conditions.
          </p>
          
          <div className="mt-8 text-sm text-foreground/60">
            Last updated: {lastUpdated}
          </div>
        </div>

        {/* Overview */}
        <Card className="glass-card border-primary/20 mb-12">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" />
              Agreement to Terms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/80 leading-relaxed mb-4">
              These Terms of Service ("Terms") govern your use of Talent Hire ("Service," "Platform," or "we"), 
              operated by Talent Hire ("Company," "we," or "us"). By accessing or using our Service, you agree 
              to be bound by these Terms.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              If you disagree with any part of these terms, then you may not access the Service. These Terms apply 
              to all visitors, users, and others who access or use the Service.
            </p>
          </CardContent>
        </Card>

        {/* Service Description */}
        <Card className="glass-card border-primary/20 mb-12">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <Briefcase className="h-6 w-6 text-primary" />
              Service Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-foreground/80 leading-relaxed">
                Talent Hire is a Web3 job platform that connects job seekers with blockchain and 
                decentralized technology opportunities. Our services include:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h4 className="font-semibold text-lg mb-3 text-foreground">For Job Seekers</h4>
                  <ul className="list-disc list-inside space-y-2 text-foreground/70 text-sm">
                    <li>Browse and search job listings</li>
                    <li>Apply for positions</li>
                    <li>Connect with employers</li>
                    <li>Manage applications and profile</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-lg mb-3 text-foreground">For Employers</h4>
                  <ul className="list-disc list-inside space-y-2 text-foreground/70 text-sm">
                    <li>Post job opportunities</li>
                    <li>Review applications</li>
                    <li>Connect with candidates</li>
                    <li>Manage hiring process</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Accounts */}
        <Card className="glass-card border-primary/20 mb-12">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <Users className="h-6 w-6 text-primary" />
              User Accounts & Responsibilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-lg mb-3 text-foreground">Account Creation</h4>
                <ul className="list-disc list-inside space-y-2 text-foreground/70">
                  <li>You must provide accurate and complete information when creating an account</li>
                  <li>You are responsible for maintaining the security of your account credentials</li>
                  <li>You may only have one account type per email address</li>
                  <li>You must be at least 18 years old to use our services</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-lg mb-3 text-foreground">Prohibited Activities</h4>
                <ul className="list-disc list-inside space-y-2 text-foreground/70">
                  <li>Creating fake or misleading profiles</li>
                  <li>Posting fraudulent or illegal job listings</li>
                  <li>Harassing or discriminating against other users</li>
                  <li>Attempting to circumvent platform security measures</li>
                  <li>Using the platform for any illegal purposes</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-lg mb-3 text-foreground">Account Termination</h4>
                <p className="text-foreground/70">
                  We reserve the right to terminate or suspend accounts that violate these Terms, 
                  engage in fraudulent activities, or pose a risk to other users or the platform.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Postings & Applications */}
        <Card className="glass-card border-primary/20 mb-12">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <Briefcase className="h-6 w-6 text-primary" />
              Job Postings & Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-lg mb-3 text-foreground">Job Posting Requirements</h4>
                <ul className="list-disc list-inside space-y-2 text-foreground/70">
                  <li>All job postings must be accurate and truthful</li>
                  <li>Employers must provide complete job descriptions and requirements</li>
                  <li>Compensation information must be clearly stated</li>
                  <li>Jobs must comply with applicable labor laws and regulations</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-lg mb-3 text-foreground">Application Process</h4>
                <ul className="list-disc list-inside space-y-2 text-foreground/70">
                  <li>Job seekers must provide accurate application information</li>
                  <li>Applications are subject to employer review and selection</li>
                  <li>We do not guarantee job placement or employment</li>
                  <li>Communication between employers and candidates is their responsibility</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-lg mb-3 text-foreground">Payment & Compensation</h4>
                <p className="text-foreground/70">
                  While we facilitate connections between job seekers and employers, we are not 
                  responsible for payment processing, salary negotiations, or employment contracts. 
                  These matters are between the parties involved.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blockchain & Web3 */}
        <Card className="glass-card border-primary/20 mb-12">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" />
              Blockchain & Web3 Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-foreground/80 leading-relaxed">
                Our platform integrates with blockchain technology and Web3 services. By using these features, you acknowledge:
              </p>
              
              <ul className="list-disc list-inside space-y-2 text-foreground/70">
                <li>Blockchain transactions are irreversible and subject to network conditions</li>
                <li>You are responsible for securing your wallet and private keys</li>
                <li>We are not responsible for losses due to wallet security issues</li>
                <li>Smart contract interactions are subject to their respective terms</li>
                <li>Cryptocurrency values are volatile and subject to market conditions</li>
              </ul>
              
              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <span className="font-semibold text-yellow-500">Important Notice</span>
                </div>
                <p className="text-yellow-500/80 text-sm">
                  Cryptocurrency and blockchain technology involve significant risks. 
                  Only invest what you can afford to lose and ensure you understand 
                  the technology before use.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card className="glass-card border-primary/20 mb-12">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary" />
              Intellectual Property & Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-foreground/80 leading-relaxed">
                Our platform and its original content, features, and functionality are owned by 
                Talent Hire and are protected by international copyright, trademark, patent, 
                trade secret, and other intellectual property laws.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h4 className="font-semibold text-lg mb-3 text-foreground">User Content</h4>
                  <ul className="list-disc list-inside space-y-2 text-foreground/70 text-sm">
                    <li>You retain ownership of content you submit</li>
                    <li>You grant us license to use and display your content</li>
                    <li>You are responsible for the content you post</li>
                    <li>We may remove content that violates our policies</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-lg mb-3 text-foreground">Platform Content</h4>
                  <ul className="list-disc list-inside space-y-2 text-foreground/70 text-sm">
                    <li>Our platform design and functionality are proprietary</li>
                    <li>You may not copy or reverse engineer our platform</li>
                    <li>Our branding and trademarks are protected</li>
                    <li>Third-party content is subject to their terms</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimers & Limitations */}
        <Card className="glass-card border-primary/20 mb-12">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-primary" />
              Disclaimers & Limitations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-foreground/80 leading-relaxed">
                The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranties 
                regarding the accuracy, reliability, or availability of our services.
              </p>
              
              <ul className="list-disc list-inside space-y-2 text-foreground/70">
                <li>We do not guarantee job placement or employment outcomes</li>
                <li>We are not responsible for employer-candidate relationships</li>
                <li>Platform availability may be subject to maintenance or technical issues</li>
                <li>We do not verify all user information or job postings</li>
                <li>Blockchain services are subject to network conditions and third-party terms</li>
              </ul>
              
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                  <span className="font-semibold text-blue-500">What We Do Provide</span>
                </div>
                <ul className="text-blue-500/80 text-sm space-y-1">
                  <li>• Secure platform for job connections</li>
                  <li>• User verification and security measures</li>
                  <li>• Customer support and dispute resolution</li>
                  <li>• Regular platform updates and improvements</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact & Updates */}
        <Card className="glass-card border-primary/30 bg-gradient-to-r from-primary/5 to-primary-glow/5">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Contact & Updates</CardTitle>
            <CardDescription className="text-center">
              For questions about these Terms or to report violations, please contact us:
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-4">
              <p className="text-foreground/80">
                <strong>Email:</strong> legal@talenthire.com
              </p>
              <p className="text-foreground/80">
                <strong>Legal Team:</strong> Talent Hire Legal Department
              </p>
              <p className="text-foreground/80">
                <strong>Response Time:</strong> We aim to respond to legal inquiries within 72 hours
              </p>
              
              <div className="mt-6 p-4 bg-foreground/5 rounded-lg">
                <p className="text-foreground/70 text-sm">
                  <strong>Note:</strong> These Terms may be updated periodically. We will notify users 
                  of significant changes via email or platform notifications. Continued use of our 
                  services constitutes acceptance of updated terms.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TermsOfService;
