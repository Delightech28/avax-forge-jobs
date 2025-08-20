import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Using Express API instead of Supabase
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import { db } from '@/integrations/firebase/client';
import { collection, getDocs, addDoc } from 'firebase/firestore';

interface Company {
  id: string;
  name: string;
}

const PostJob = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    company_id: "",
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
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchCompanies();
  }, [user, navigate]);

  const fetchCompanies = async () => {
    try {
      const snap = await getDocs(collection(db, 'companies'));
      setCompanies(snap.docs.map((d) => ({ id: d.id, name: (d.data() as any).name })));
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

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
    
    if (!formData.title || !formData.description || !formData.company_id) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
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
      toast.error("Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Post a Job</h1>
            <p className="text-muted-foreground">
              Find the best talent for your Web3 and traditional tech roles
            </p>
          </div>

          {companies.length === 0 && (
            <Card className="mb-6 border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
              <CardContent className="pt-6">
                <p className="text-sm">
                  You need to create a company profile before posting jobs.{" "}
                  <Button variant="link" className="p-0 h-auto" asChild>
                    <a href="/companies/new">Create Company</a>
                  </Button>
                </p>
              </CardContent>
            </Card>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
                <CardDescription>
                  Provide the basic information about the position
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="e.g. Senior Frontend Developer"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="company">Company *</Label>
                  <Select 
                    value={formData.company_id} 
                    onValueChange={(value) => handleInputChange("company_id", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
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

                  <div>
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
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

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      placeholder="e.g. San Francisco, CA"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Describe the role, responsibilities, and what makes it exciting..."
                    rows={6}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="requirements">Requirements</Label>
                  <Textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={(e) => handleInputChange("requirements", e.target.value)}
                    placeholder="List the required skills, experience, and qualifications..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="benefits">Benefits</Label>
                  <Textarea
                    id="benefits"
                    value={formData.benefits}
                    onChange={(e) => handleInputChange("benefits", e.target.value)}
                    placeholder="Health insurance, equity, flexible hours, etc..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Required Skills</CardTitle>
                <CardDescription>
                  Add the key skills required for this position
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="e.g. React, TypeScript, Node.js"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  />
                  <Button type="button" onClick={addSkill} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="pr-1">
                        {skill}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto p-1 ml-1"
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

            {/* Compensation */}
            <Card>
              <CardHeader>
                <CardTitle>Compensation</CardTitle>
                <CardDescription>
                  Set the salary range and any crypto compensation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="salaryMin">Min Salary</Label>
                    <Input
                      id="salaryMin"
                      type="number"
                      value={formData.salary_min}
                      onChange={(e) => handleInputChange("salary_min", e.target.value)}
                      placeholder="50000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="salaryMax">Max Salary</Label>
                    <Input
                      id="salaryMax"
                      type="number"
                      value={formData.salary_max}
                      onChange={(e) => handleInputChange("salary_max", e.target.value)}
                      placeholder="80000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select 
                      value={formData.salary_currency} 
                      onValueChange={(value) => handleInputChange("salary_currency", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tokenCompensation">Token Symbol</Label>
                    <Input
                      id="tokenCompensation"
                      value={formData.token_compensation}
                      onChange={(e) => handleInputChange("token_compensation", e.target.value)}
                      placeholder="e.g. AVAX, ETH"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tokenAmount">Token Amount</Label>
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
                  <Label htmlFor="requiresWallet">
                    Requires Web3 wallet connection
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Job Expiry */}
            <Card>
              <CardHeader>
                <CardTitle>Job Posting Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
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

            <Button 
              type="submit" 
              disabled={loading || companies.length === 0}
              className="w-full"
              size="lg"
            >
              {loading ? "Posting..." : "Post Job"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default PostJob;