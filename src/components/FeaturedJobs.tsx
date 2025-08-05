import JobCard from "./JobCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const FeaturedJobs = () => {
  // Mock data - will be replaced with blockchain data
  const mockJobs = [
    {
      id: "1",
      title: "Senior Smart Contract Developer",
      company: "DeFi Protocol Labs",
      location: "Remote",
      type: "Full-time",
      salary: "$120k - $180k",
      postedAt: "2 days ago",
      isVerified: true,
      tags: ["Solidity", "Web3", "DeFi", "Avalanche"],
      description: "Join our team building the next generation of DeFi protocols on Avalanche. Looking for experienced Solidity developers."
    },
    {
      id: "2",
      title: "Frontend Developer - Web3",
      company: "MetaVerse Studios",
      location: "San Francisco, CA",
      type: "Full-time",
      salary: "$90k - $130k",
      postedAt: "1 day ago",
      isVerified: true,
      tags: ["React", "TypeScript", "Web3", "Ethers.js"],
      description: "Build beautiful user interfaces for our Web3 gaming platform. Experience with React and Web3 libraries required."
    },
    {
      id: "3",
      title: "Blockchain Product Manager",
      company: "Crypto Innovations",
      location: "New York, NY",
      type: "Full-time",
      salary: "$140k - $200k",
      postedAt: "3 days ago",
      isVerified: false,
      tags: ["Product Management", "Blockchain", "Strategy"],
      description: "Lead product development for our suite of blockchain tools. Looking for someone with deep crypto knowledge."
    },
    {
      id: "4",
      title: "Web3 Security Auditor",
      company: "SecureChain Audits",
      location: "Remote",
      type: "Contract",
      salary: "$150 - $250/hr",
      postedAt: "5 days ago",
      isVerified: true,
      tags: ["Security", "Auditing", "Solidity", "Smart Contracts"],
      description: "Conduct security audits for smart contracts and DeFi protocols. Experience with formal verification preferred."
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-transparent to-card/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Featured <span className="gradient-text">Opportunities</span>
          </h2>
          <p className="text-foreground/70 text-lg max-w-2xl mx-auto">
            Discover the latest Web3 job opportunities from verified companies building the future
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {mockJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>

        <div className="text-center">
          <Button variant="gradient" size="lg">
            View All Jobs
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedJobs;