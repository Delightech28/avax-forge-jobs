import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { 
  Mail, 
  MessageCircle, 
  Users, 
  Globe, 
  Shield, 
  FileText, 
  HelpCircle, 
  BookOpen,
  Briefcase,
  Search,
  User,
  DollarSign,
  Building
} from "lucide-react";

const Footer = () => {
  const { user } = useAuth();

  return (
    <footer className="bg-card border-t border-border/40">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-bold gradient-text">Talent Hire</h3>
              </div>
            <p className="text-foreground/70 text-sm leading-relaxed">
              The future of Web3 employment. Connect with verified employers and discover 
              opportunities in the decentralized world.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="text-foreground/70 hover:text-foreground">
                <Mail className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-foreground/70 hover:text-foreground">
                <MessageCircle className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-foreground/70 hover:text-foreground">
                <Users className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* For Job Seekers */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              For Job Seekers
            </h4>
            <ul className="space-y-2 text-sm">
              {(!user || user.role !== 'company') && (
                <li>
                  <Link to="/jobs" className="text-foreground/70 hover:text-foreground transition-colors">
                    Browse Jobs
                  </Link>
                </li>
              )}
              <li>
                <span className="text-foreground/50 cursor-not-allowed">
                  Web3 Jobs
                </span>
              </li>
              <li>
                <Link to="/profile" className="text-foreground/70 hover:text-foreground transition-colors">
                  My Profile
                </Link>
              </li>
              <li>
                <span className="text-foreground/50 cursor-not-allowed">
                  My Applications
                </span>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Building className="h-4 w-4" />
              For Employers
            </h4>
            <ul className="space-y-2 text-sm">
              {user?.role === 'company' ? (
                <>
              <li>
                    <Link to="/post-job" className="text-foreground/70 hover:text-foreground transition-colors">
                  Post a Job
                    </Link>
              </li>
              <li>
                    <Link to="/profile" className="text-foreground/70 hover:text-foreground transition-colors">
                      Employer Dashboard
                    </Link>
              </li>
                </>
              ) : (
                <>
                  <li>
                    <span className="text-foreground/50 cursor-not-allowed">
                      Post a Job
                    </span>
              </li>
              <li>
                    <span className="text-foreground/50 cursor-not-allowed">
                  Employer Dashboard
                    </span>
                  </li>
                </>
              )}
              <li>
                <span className="text-foreground/50 cursor-not-allowed">
                  Pricing
                </span>
              </li>
            </ul>
          </div>

          {/* Company & Support */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Company & Support
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-foreground/70 hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-foreground/70 hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-foreground/70 hover:text-foreground transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-foreground/70 hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border/40 mt-8 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-6 text-sm text-foreground/70">
              <Link to="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <span>© 2025 Talent Hire. All rights reserved.</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-foreground/70">
              <Shield className="h-4 w-4" />
              <span>Built on Base Blockchain</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;