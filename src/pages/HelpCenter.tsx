import { useMemo, useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, HelpCircle, MessageCircle, BookOpen, Shield, Users, Briefcase, Wallet } from "lucide-react";

const HelpCenter = () => {
  const [query, setQuery] = useState("");
  const faqCategories = [
    {
      title: "Getting Started",
      icon: <HelpCircle className="h-6 w-6" />,
      faqs: [
        {
          question: "How do I create an account?",
          answer: "Click the 'Sign In' button in the header, then select 'Email' tab and click 'Create Account'. Fill in your details and choose your role (job seeker or employer)."
        },
        {
          question: "What's the difference between job seeker and employer accounts?",
          answer: "Job seekers can browse and apply for jobs, while employers can post job listings and manage applications. You can only have one account type per email address."
        },
        {
          question: "How do I connect my wallet?",
          answer: "After signing in, go to your profile page and click 'Connect Wallet' in the wallet section. You can choose either MetaMask or Core Wallet. Make sure you have your preferred wallet installed in your browser."
        }
      ]
    },
    {
      title: "Job Seeking",
      icon: <Users className="h-6 w-6" />,
      faqs: [
        {
          question: "How do I search for jobs?",
          answer: "Use the search bar on the jobs page to find specific positions, or use filters for job type, location, and experience level."
        },
        {
          question: "How do I apply for a job?",
          answer: "Click on a job listing to view details, then click 'Apply Now'. You'll need to be signed in and may need to connect your wallet depending on the job requirements."
        },
        {
          question: "Can I save jobs for later?",
          answer: "Yes! Click the heart icon on any job listing to save it. You can view all saved jobs in your profile."
        }
      ]
    },
    {
      title: "Employer Features",
      icon: <Briefcase className="h-6 w-6" />,
      faqs: [
        {
          question: "How do I post a job?",
          answer: "Sign in with an employer account, then click 'Post a Job' in the header. Fill out the job details form and submit."
        },
        {
          question: "What information do I need to provide when posting a job?",
          answer: "You'll need the job title, description, requirements, salary range, location, and whether you offer token compensation."
        },
        {
          question: "How do I manage applications?",
          answer: "View all applications in your employer dashboard. You can review candidates, schedule interviews, and update application statuses."
        }
      ]
    },
    {
      title: "Security & Privacy",
      icon: <Shield className="h-6 w-6" />,
      faqs: [
        {
          question: "Is my personal information secure?",
          answer: "Yes, we use industry-standard encryption and security measures. Your data is stored securely and never shared without permission."
        },
        {
          question: "How do you verify companies?",
          answer: "We verify company information through multiple sources and require business documentation for employer accounts."
        },
        {
          question: "What happens if I find a suspicious job posting?",
          answer: "Report it immediately using the report button on the job listing. Our team will investigate and take appropriate action."
        }
      ]
    }
  ];

  const contactMethods = [
    {
      title: "Email Support",
      description: "Get help via email within 24 hours",
      icon: <MessageCircle className="h-8 w-8" />,
      action: "support@avaxforgejobs.com"
    },
    {
      title: "Documentation",
      description: "Browse our comprehensive guides",
      icon: <BookOpen className="h-8 w-8" />,
      action: "View Docs"
    },
    {
      title: "Community",
      description: "Join our Discord community",
      icon: <Users className="h-8 w-8" />,
      action: "Join Discord"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-slide-up">
            <HelpCircle className="h-4 w-4 text-primary mr-2" />
            <span className="text-sm font-medium">Help Center</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            How Can We <span className="gradient-text">Help You?</span>
          </h1>
          
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.4s' }}>
            Find answers to common questions, learn how to use our platform, 
            and get the support you need to succeed in the Web3 job market.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground/50" />
            <input
              type="text"
              placeholder="Search for help articles, FAQs, or topics..."
              className="w-full pl-12 pr-4 py-4 bg-background border border-primary/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-lg"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">
            Quick <span className="gradient-text">Actions</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactMethods.map((method, index) => (
              <Card key={index} className="glass-card border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-xl text-center">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    {method.icon}
                  </div>
                  <CardTitle className="text-lg">{method.title}</CardTitle>
                  <CardDescription className="text-foreground/70">
                    {method.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <button className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
                    {method.action}
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-12">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          
          <div className="space-y-8">
            {faqCategories.map((category, categoryIndex) => (
              <Card key={categoryIndex} className="glass-card border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      {category.icon}
                    </div>
                    <CardTitle className="text-2xl">{category.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {category.faqs
                      .filter(f =>
                        !query.trim() ||
                        f.question.toLowerCase().includes(query.toLowerCase()) ||
                        f.answer.toLowerCase().includes(query.toLowerCase())
                      )
                      .map((faq, faqIndex) => (
                      <div key={faqIndex} className="border-b border-primary/10 pb-4 last:border-b-0">
                        <h4 className="font-semibold text-lg mb-2 text-foreground">
                          {faq.question}
                        </h4>
                        <p className="text-foreground/70 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Getting Started Guide */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-12">
            Getting <span className="gradient-text">Started</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass-card border-primary/20 text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <CardTitle>Create Account</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/70 text-sm">
                  Sign up with your email or connect your wallet to get started
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-primary/20 text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <CardTitle>Choose Role</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/70 text-sm">
                  Select whether you're looking for jobs or hiring talent
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-primary/20 text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <CardTitle>Complete Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/70 text-sm">
                  Add your skills, experience, and preferences to your profile
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-primary/20 text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">4</span>
                </div>
                <CardTitle>Start Exploring</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/70 text-sm">
                  Browse jobs, post listings, or connect with the community
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact Support */}
        <div className="text-center">
          <Card className="glass-card border-primary/30 bg-gradient-to-r from-primary/5 to-primary-glow/5">
            <CardContent className="pt-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">
                Still Need Help?
              </h3>
              <p className="text-foreground/70 mb-6 max-w-2xl mx-auto">
                Can't find what you're looking for? Our support team is here to help. 
                Reach out and we'll get back to you as soon as possible.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                  Contact Support
                </button>
                <button className="px-6 py-3 border border-primary/30 text-foreground rounded-md hover:bg-primary/10 transition-colors">
                  Join Community
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default HelpCenter;
