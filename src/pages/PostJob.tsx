import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Extend Window type for base property
declare global {
  interface Window {
  base?: unknown;
  }
}
// Using Firebase instead of Express API
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Briefcase, MapPin, DollarSign, Calendar, Zap } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import { db } from '@/integrations/firebase/client';
import { collection, addDoc, doc as fsDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useJobPayment } from "@/hooks/useJobPayment";
import { filterSkills } from '@/lib/skills';
import { WalletSelectModal } from '@/components/ui/wallet-select-modal';



const PostJob = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);

  const [formData, setFormData] = useState({
  title: "",
  description: "",
  job_type: "full_time",
  location_type: "remote",
  location: "",
  salary_min: "",
  salary_max: "",
  salary_currency: "USD",
  experience_level: "mid",
  requirements: "",
  benefits: "",
  token_symbol: "",
  requires_wallet: false,
  expires_at: "",
  industry: "",
  });

  const { payAndPostJob, loading: paymentLoading, error: paymentError } = useJobPayment();
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  interface PendingJobData {
    verifiedLevel: string;
    jobData: Record<string, unknown>;
    provider?: unknown;
  }
  const [pendingJobData, setPendingJobData] = useState<PendingJobData | null>(null);
  const handleWalletSelect = async (wallet: "metamask" | "core") => {
    setWalletModalOpen(false);
    if (!pendingJobData) return;
    type EthereumProvider = {
      isMetaMask?: boolean;
  isBase?: boolean;
      [key: string]: unknown;
    };
    let provider: EthereumProvider | null = null;
    if (wallet === "metamask" && window.ethereum && window.ethereum.isMetaMask) {
      provider = window.ethereum;
    } else if (wallet === "core" && window.base) {
      provider = window.base as EthereumProvider;
    } else if (
      wallet === "core" &&
      window.ethereum &&
      (window.ethereum as { isBase?: boolean }).isBase
    ) {
      provider = window.ethereum;
    } else {
      toast.error("Selected wallet not found. Please install it and try again.");
      setSubmitting(false);
      return;
    }
    try {
      const result = await payAndPostJob({ ...pendingJobData, provider });
      toast.success("Job posted successfully!");
      navigate(`/jobs/${result.jobId}`, { state: { fromPostJob: true } });
    } catch (error) {
      console.error("Error posting job:", error);
      toast.error(paymentError || "Failed to post job");
    } finally {
      setSubmitting(false);
      setPendingJobData(null);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/auth?redirectTo=/post-job");
      return;
    }
    if (user.role !== 'company') {
      toast.error("Only verified companies can post jobs.");
      navigate("/");
      return;
    }
  }, [user, loading, navigate]);



  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  useEffect(() => {
    setSkillSuggestions(filterSkills(newSkill, 8));
  }, [newSkill]);

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Enhanced validation
    const errors = [];
    if (!formData.title || !formData.description) {
      errors.push("Please fill in all required fields (title, description)");
    }
    if (skills.length === 0) {
      errors.push("Please add at least one required skill");
    }
    if (!formData.salary_min || !formData.salary_max) {
      errors.push("Please specify both minimum and maximum salary");
    }
    if (!formData.salary_currency) {
      errors.push("Please select a currency");
    }
    if (!formData.token_symbol) {
      errors.push("Please enter a token symbol");
    }
    // Token amount is optional - no validation required
    if (errors.length > 0) {
      toast.error(errors.join(". "));
      return;
    }
    setSubmitting(true);
    try {
      // Preflight: ensure authenticated company with users/{uid}.role === 'company'
      if (!user) {
        toast.error('Please sign in to post a job');
        setSubmitting(false);
        return;
      }
      const userRef = fsDoc(db, 'users', user.id as string);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        toast.error('Your company profile is not initialized. Please sign out and sign in again.');
        setSubmitting(false);
        return;
      }
      interface UserData {
        role: string;
        companyName?: string;
        verified?: string;
        [key: string]: unknown;
      }
      const userData = userSnap.data() as UserData;
  // ...existing code...
      if (userData.role !== 'company') {
        toast.error('Only verified companies can post jobs.');
        setSubmitting(false);
        return;
      }
      // Prevent non-verified (Basic) companies from posting more than 2 jobs
      const verifiedPlans = ["ProMonthly", "EliteMonthly", "ProAnnual", "EliteAnnual"];
      if (!verifiedPlans.includes(userData.verified || "") && typeof userData.postedjob === 'number' && userData.postedjob >= 2) {
        toast.error('You have reached your monthly limit of 2 job postings. Upgrade to Pro to post more jobs.');
        setSubmitting(false);
        return;
      }
      const jobData = {
        ...formData,
        company_name: userData.companyName || userData.fullName || (userData.profile && typeof userData.profile === "object" && userData.profile !== null && "full_name" in userData.profile ? (userData.profile as { full_name?: string }).full_name : "") || "",
        posted_by: user?.id,
        companyId: user?.id,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
        skills,
        industry: formData.industry,
        created_at: new Date().toISOString(),
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
      };
      let verifiedLevel = userData.verified || "Basic";
      if (verifiedLevel === "ProMonthly") verifiedLevel = "Pro Monthly";
      else if (verifiedLevel === "EliteMonthly") verifiedLevel = "Elite Monthly";
      // Do not convert EliteAnnual
      setPendingJobData({ verifiedLevel, jobData });
      setWalletModalOpen(true);
    } catch (error) {
      console.error("Error preparing job:", error);
      toast.error(paymentError || "Failed to prepare job");
      setSubmitting(false);
    }
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Loading...</h2>
            <p className="text-muted-foreground">Please wait while we check your authentication status.</p>
          </div>
        </div>
      </div>
    );
  }

  // Show sign in required if user is null
  if (user === null) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
            <p className="text-muted-foreground mb-6">You need to be signed in to post a job.</p>
            <Button onClick={() => navigate("/auth?redirectTo=/post-job")} size="lg">
              Sign In to Post Job
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show access denied if user is not a company
  if (user && user.role !== 'company') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-muted-foreground mb-6">Only companies can post jobs. Please sign up as a company to access this feature.</p>
            <Button onClick={() => navigate("/auth")} size="lg">
              Sign Up as Company
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Post a Job
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find the best talent for your Web3 and traditional tech roles. 
              Reach thousands of qualified developers and professionals.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card className="border-2 border-primary/10">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Job Details
                </CardTitle>
                <CardDescription>
                  Provide the essential information about the position
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-base font-medium">
                      Job Title *
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      placeholder="e.g. Senior Smart Contract Developer"
                      className="h-12 text-lg"
                      required
                    />
                  </div>

                                     <div className="space-y-2">
                     {/* Company name field and label removed. Will be set from profile. */}
                   </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-base font-medium">
                    Job Description *
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Describe the role, responsibilities, and what makes it exciting..."
                    rows={6}
                    className="text-base"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="jobType">Job Type</Label>
                    <Select 
                      value={formData.job_type} 
                      onValueChange={(value) => handleInputChange("job_type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full_time">Full Time</SelectItem>
                        <SelectItem value="part_time">Part Time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                        <SelectItem value="freelance">Freelance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experienceLevel">Experience Level</Label>
                    <Select 
                      value={formData.experience_level} 
                      onValueChange={(value) => handleInputChange("experience_level", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">Entry Level</SelectItem>
                        <SelectItem value="mid">Mid Level</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="executive">Executive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="locationType">Location Type</Label>
                    <Select 
                      value={formData.location_type} 
                      onValueChange={(value) => handleInputChange("location_type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="on_site">On-site</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        placeholder="e.g. San Francisco, CA or Remote"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select
                      value={formData.industry}
                      onValueChange={(value) => handleInputChange("industry", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select or search industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Web2 Industries */}
                        <SelectItem value="Software">Software</SelectItem>
                        <SelectItem value="Fintech">Fintech</SelectItem>
                        <SelectItem value="E-commerce">E-commerce</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Gaming">Gaming</SelectItem>
                        <SelectItem value="Media">Media</SelectItem>
                        <SelectItem value="Telecommunications">Telecommunications</SelectItem>
                        {/* Web3 Industries */}
                        <SelectItem value="Blockchain">Blockchain</SelectItem>
                        <SelectItem value="DeFi">DeFi</SelectItem>
                        <SelectItem value="NFTs">NFTs</SelectItem>
                        <SelectItem value="DAOs">DAOs</SelectItem>
                        <SelectItem value="Metaverse">Metaverse</SelectItem>
                        <SelectItem value="Web3 Gaming">Web3 Gaming</SelectItem>
                        <SelectItem value="Crypto">Crypto</SelectItem>
                        <SelectItem value="Identity">Identity</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills Section */}
            <Card className="border-2 border-blue-500/10">
              <CardHeader className="bg-gradient-to-r from-blue-500/5 to-blue-500/10">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-500" />
                  Required Skills *
                </CardTitle>
                <CardDescription>
                  Add the key skills required for this position (at least one skill is required)
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="e.g. React, TypeScript, Solidity"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                    className="flex-1"
                  />
                  <Button type="button" onClick={addSkill} size="sm" className="px-6">
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
                {skillSuggestions.length > 0 && (
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {skillSuggestions.map(s => (
                      <button key={s} type="button" onClick={() => { setNewSkill(''); if (!skills.includes(s)) setSkills(prev => [...prev, s]); }} className="text-sm px-2 py-1 rounded border hover:bg-blue-50 text-left">
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="pr-1 text-sm">
                        {skill}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto p-1 ml-1 hover:bg-destructive/20"
                          onClick={() => removeSkill(skill)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Compensation Section */}
            <Card className="border-2 border-green-500/10">
              <CardHeader className="bg-gradient-to-r from-green-500/5 to-green-500/10">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  Compensation & Benefits
                </CardTitle>
                <CardDescription>
                  Set the salary range and any additional benefits
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="salaryMin">Min Salary *</Label>
                    <Input
                      id="salaryMin"
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={formData.salary_min}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        handleInputChange("salary_min", val);
                      }}
                      placeholder="50000"
                      className="h-12 no-spinner"
                      required
                      style={{ MozAppearance: 'textfield' }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaryMax">Max Salary *</Label>
                    <Input
                      id="salaryMax"
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={formData.salary_max}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        handleInputChange("salary_max", val);
                      }}
                      placeholder="80000"
                      className="h-12 no-spinner"
                      required
                      style={{ MozAppearance: 'textfield' }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency *</Label>
                    <Input
                      id="currency"
                      value="USD"
                      disabled
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="requirements">Requirements</Label>
                    <Textarea
                      id="requirements"
                      value={formData.requirements}
                      onChange={(e) => handleInputChange("requirements", e.target.value)}
                      placeholder="List the required skills, experience, and qualifications..."
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="benefits">Benefits</Label>
                    <Textarea
                      id="benefits"
                      value={formData.benefits}
                      onChange={(e) => handleInputChange("benefits", e.target.value)}
                      placeholder="Health insurance, equity, flexible hours, etc..."
                      rows={4}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="tokenCompensation">Token Symbol</Label>
                    <Input
                      id="tokenCompensation"
                      value={formData.token_symbol}
                      onChange={(e) => handleInputChange("token_symbol", e.target.value)}
                      placeholder="e.g. BASE"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="requiresWallet"
                    checked={formData.requires_wallet}
                    onCheckedChange={(checked) => handleInputChange("requires_wallet", checked)}
                  />
                  <Label htmlFor="requiresWallet" className="text-base">
                    Requires Web3 wallet connection
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Job Expiry */}
            <Card className="border-2 border-orange-500/10">
              <CardHeader className="bg-gradient-to-r from-orange-500/5 to-orange-500/10">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-orange-500" />
                  Job Posting Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Label htmlFor="expiresAt">Expires At (Optional)</Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={formData.expires_at}
                    onChange={(e) => handleInputChange("expires_at", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="text-center">
              <Button 
                type="submit" 
                disabled={submitting}
                className="w-full max-w-md h-14 text-lg font-semibold"
                size="lg"
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Posting Job...
                  </div>
                ) : (
                  <>
                    <Briefcase className="mr-2 h-5 w-5" />
                    Post Job
                  </>
                )}
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Your job will be visible to thousands of qualified candidates
              </p>
              <WalletSelectModal
                open={walletModalOpen}
                onSelect={handleWalletSelect}
                onClose={() => { setWalletModalOpen(false); setSubmitting(false); setPendingJobData(null); }}
              />
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default PostJob;