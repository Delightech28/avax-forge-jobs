
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, X, Briefcase, MapPin, DollarSign, Calendar, Zap } from "lucide-react";
import { filterSkills } from '@/lib/skills';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import Header from "@/components/Header";

const EditJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  interface Job {
    title: string;
    description: string;
    job_type: string;
    location_type: string;
    location: string;
    salary_min: number | null;
    salary_max: number | null;
    salary_currency: string;
    experience_level: string;
    requirements: string;
    benefits: string;
    token_symbol: string;
    requires_wallet: boolean;
    expires_at: string;
    industry: string;
    skills: string[];
    // Add other fields as needed
  }

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) return;
      const jobRef = doc(db, "jobs", jobId);
      const jobSnap = await getDoc(jobRef);
      if (jobSnap.exists()) {
        const data = jobSnap.data();
        setJob(data as Job);
        setFormData({
          title: data.title ?? "",
          description: data.description ?? "",
          job_type: data.job_type ?? "full_time",
          location_type: data.location_type ?? "remote",
          location: data.location ?? "",
          salary_min: data.salary_min?.toString() ?? "",
          salary_max: data.salary_max?.toString() ?? "",
          salary_currency: data.salary_currency ?? "USD",
          experience_level: data.experience_level ?? "mid",
          requirements: data.requirements ?? "",
          benefits: data.benefits ?? "",
          token_symbol: data.token_symbol ?? "",
          requires_wallet: data.requires_wallet ?? false,
          expires_at: data.expires_at ? data.expires_at.slice(0, 16) : "",
          industry: data.industry ?? "",
        });
        setSkills(data.skills ?? []);
      }
      setLoading(false);
    };
    fetchJob();
  }, [jobId]);

  useEffect(() => {
    setSkillSuggestions(filterSkills(newSkill, 8));
  }, [newSkill]);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobId) return;
    const jobRef = doc(db, "jobs", jobId);
    await updateDoc(jobRef, {
      ...formData,
      salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
      salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
      skills,
    });
    navigate("/manage-jobs");
  };

  if (loading) return <div><Header /><div className="container mx-auto px-4 py-8">Loading...</div></div>;
  if (!job) return <div><Header /><div className="container mx-auto px-4 py-8">Job not found.</div></div>;

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h2 className="text-2xl font-bold mb-4">Edit Job</h2>
        <form onSubmit={handleSave} className="space-y-8">
          {/* Basic Information */}
          <Card className="border-2 border-primary/10">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Job Details
              </CardTitle>
              <CardDescription>
                Edit the essential information about the position
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
              className="w-full max-w-md h-14 text-lg font-semibold"
              size="lg"
            >
              <Briefcase className="mr-2 h-5 w-5" />
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditJob;
import { useParams, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
