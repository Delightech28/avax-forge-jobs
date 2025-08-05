import { Separator } from "@/components/ui/separator";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-glow rounded-lg flex items-center justify-center glow-effect">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <h3 className="text-lg font-bold gradient-text">AVAX Forge Jobs</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              The premier destination for Web3 and traditional tech jobs. 
              Connect talent with opportunity in the decentralized future.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* For Job Seekers */}
          <div className="space-y-4">
            <h4 className="font-semibold">For Job Seekers</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/jobs" className="text-muted-foreground hover:text-foreground transition-colors">
                  Browse Jobs
                </a>
              </li>
              <li>
                <a href="/jobs?type=remote" className="text-muted-foreground hover:text-foreground transition-colors">
                  Remote Jobs
                </a>
              </li>
              <li>
                <a href="/jobs?type=web3" className="text-muted-foreground hover:text-foreground transition-colors">
                  Web3 Jobs
                </a>
              </li>
              <li>
                <a href="/profile" className="text-muted-foreground hover:text-foreground transition-colors">
                  My Profile
                </a>
              </li>
              <li>
                <a href="/applications" className="text-muted-foreground hover:text-foreground transition-colors">
                  My Applications
                </a>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div className="space-y-4">
            <h4 className="font-semibold">For Employers</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/post-job" className="text-muted-foreground hover:text-foreground transition-colors">
                  Post a Job
                </a>
              </li>
              <li>
                <a href="/companies/new" className="text-muted-foreground hover:text-foreground transition-colors">
                  Create Company
                </a>
              </li>
              <li>
                <a href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                  Employer Dashboard
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="font-semibold">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="/help" className="text-muted-foreground hover:text-foreground transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-muted-foreground">
            © {currentYear} AVAX Forge Jobs. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm">
            <a href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;