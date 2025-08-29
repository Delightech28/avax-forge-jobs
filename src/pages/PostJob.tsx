import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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



const PostJob = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    company_name: user?.fullName || "",
    job_type: "full_time",
    location_type: "remote",
    location: "",
    salary_min: "",
    salary_max: "",
    salary_currency: "USD",
    experience_level: "mid",
    requirements: "",
    benefits: "",
    token_compensation: "",
    token_amount: "",
    requires_wallet: false,
    expires_at: "",
  });

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

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced validation
    const errors = [];
    
    if (!formData.title || !formData.description || !formData.company_name) {
      errors.push("Please fill in all required fields (title, description, company name)");
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
        return;
      }
      const userRef = fsDoc(db, 'users', user.id as string);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        console.warn('[PostJob] users doc not found for uid:', user.id);
        toast.error('Your company profile is not initialized. Please sign out and sign in again.');
        return;
      }
      const userData: any = userSnap.data();
      console.log('[PostJob] preflight', { uid: user.id, roleFromDoc: userData?.role, userDocPath: `users/${user.id}` });
      if (userData.role !== 'company') {
        toast.error('Only verified companies can post jobs.');
        return;
      }

      const jobData = {
        ...formData,
        posted_by: user?.id,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
        token_amount: formData.token_amount ? parseFloat(formData.token_amount) : null,
        skills,
        created_at: new Date().toISOString(),
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
      } as any;

      const docRef = await addDoc(collection(db, 'jobs'), jobData);
      toast.success("Job posted successfully!");
      navigate(`/jobs/${docRef.id}`);
    } catch (error) {
      console.error("Error posting job:", error);
      try {
        const err: any = error;
        console.log('[PostJob] Firestore error code:', err?.code, 'message:', err?.message);
      } catch {}
      const message = (error as any)?.code === 'permission-denied'
        ? 'Insufficient permissions. Ensure you are signed in as a company and try again.'
        : 'Failed to post job';
      toast.error(message);
    } finally {
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
                     <Label htmlFor="company">Company *</Label>
                     <Input
                       id="company"
                       value={formData.company_name}
                       onChange={(e) => handleInputChange("company_name", e.target.value)}
                       placeholder="Your company name"
                       className="h-12 text-lg"
                       required
                     />
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
                    value={formData.salary_min}
                    onChange={(e) => handleInputChange("salary_min", e.target.value)}
                    placeholder="50000"
                    className="h-12"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salaryMax">Max Salary *</Label>
                  <Input
                    id="salaryMax"
                    type="number"
                    value={formData.salary_max}
                    onChange={(e) => handleInputChange("salary_max", e.target.value)}
                    placeholder="80000"
                    className="h-12"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency *</Label>
                  <Select 
                    value={formData.salary_currency} 
                    onValueChange={(value) => handleInputChange("salary_currency", value)}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                    </SelectContent>
                  </Select>
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
                      value={formData.token_compensation}
                      onChange={(e) => handleInputChange("token_compensation", e.target.value)}
                      placeholder="e.g. AVAX, ETH"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tokenAmount" className="flex items-center gap-2">
                      Token Amount (Optional)
                      <span 
                        className="text-xs text-muted-foreground border px-1 rounded cursor-help"
                        title="Total number of tokens offered as compensation (e.g., signing bonus or equity tokens). Optional field for additional token compensation."
                      >?
                      </span>
                    </Label>
                    <Input
                      id="tokenAmount"
                      type="number"
                      step="0.01"
                      value={formData.token_amount}
                      onChange={(e) => handleInputChange("token_amount", e.target.value)}
                      placeholder="1000"
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
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default PostJob;