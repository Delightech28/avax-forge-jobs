import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
// Using Express API instead of Supabase
import { useAuth } from "@/hooks/useAuth";
import { db } from '@/integrations/firebase/client';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MapPin, Clock, DollarSign, Briefcase, ExternalLink, Heart, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";

interface JobDetail {
  id: string;
  title: string;
  description: string;
  job_type: string;
  location_type: string;
  location: string;
  salary_min: number;
  salary_max: number;
  salary_currency: string;
  experience_level: string;
  skills: string[];
  requirements: string;
  benefits: string;
  token_compensation: string;
  token_amount: number;
  requires_wallet: boolean;
  created_at: string;
  companies: {
    id: string;
    name: string;
    description: string;
    logo_url: string;
    website_url: string;
    location: string;
    size_range: string;
    industry: string;
  };
}

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    if (id) {
      fetchJob();
      checkApplicationStatus();
    }
  }, [id, user]);

  const fetchJob = async () => {
    try {
      const snap = await getDoc(doc(db, 'jobs', id as string));
      if (!snap.exists()) throw new Error('Not found');
      const j = snap.data() as any;
      setJob({
        id: snap.id,
        title: j.title,
        description: j.description,
        job_type: j.job_type,
        location_type: j.location_type,
        location: j.location,
        salary_min: j.salary_min,
        salary_max: j.salary_max,
        salary_currency: j.salary_currency,
        experience_level: j.experience_level,
        skills: j.skills || [],
        requirements: j.requirements || '',
        benefits: j.benefits || '',
        token_compensation: j.token_compensation,
        token_amount: j.token_amount,
        requires_wallet: j.requires_wallet,
        created_at: j.created_at,
        companies: j.company || (undefined as any)
      });
    } catch (error) {
      console.error("Error fetching job:", error);
      toast.error("Job not found");
      navigate("/jobs");
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    // Implement if you add applications subcollection in Firestore
    return;
  };

  const handleApply = async () => {
    if (!user) {
      toast.error("Please sign in to apply for jobs");
      navigate("/auth");
      return;
    }

    setApplying(true);
    try {
      // Implement if you add applications subcollection in Firestore
      setHasApplied(true);
      toast.success('Application submitted successfully! (local)');
    } catch (error: any) {
      toast.error('Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const saveJob = async () => {
    if (!user) {
      toast.error("Please sign in to save jobs");
      return;
    }

    try {
      // Implement saved jobs collection later
      toast.success('Job saved successfully! (local)');
    } catch (error: any) {
      toast.error('Failed to save job');
    }
  };

  const formatSalary = (min: number, max: number, currency: string) => {
    if (!min && !max) return "Salary not specified";
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    if (min && max) {
      return `${formatter.format(min)} - ${formatter.format(max)}`;
    }
    return formatter.format(min || max);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-6 bg-muted rounded w-1/2"></div>
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Job not found</h1>
            <Button onClick={() => navigate("/jobs")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/jobs")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
                  <div className="flex items-center gap-4 text-lg text-muted-foreground">
                    <span className="font-medium text-foreground">{job.companies?.name}</span>
                    {job.companies?.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.companies.location}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={saveJob}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Heart className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  {job.job_type.replace("_", " ")}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {job.location_type.replace("_", " ")}
                </Badge>
                <Badge variant="outline">
                  {job.experience_level} level
                </Badge>
                {job.requires_wallet && (
                  <Badge variant="outline" className="border-primary text-primary">
                    Web3
                  </Badge>
                )}
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Posted {new Date(job.created_at).toLocaleDateString()}
                </Badge>
              </div>

              <div className="space-y-1">
                {(job.salary_min || job.salary_max) && (
                  <p className="flex items-center gap-1 text-lg font-medium">
                    <DollarSign className="h-5 w-5" />
                    {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
                  </p>
                )}
                {job.token_compensation && (
                  <p className="flex items-center gap-1 text-lg text-primary font-medium">
                    💎 {job.token_amount} {job.token_compensation}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Job Description */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Job Description</h2>
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap">{job.description}</p>
              </div>
            </div>

            {/* Requirements */}
            {job.requirements && (
              <>
                <Separator />
                <div>
                  <h2 className="text-xl font-semibold mb-4">Requirements</h2>
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap">{job.requirements}</p>
                  </div>
                </div>
              </>
            )}

            {/* Benefits */}
            {job.benefits && (
              <>
                <Separator />
                <div>
                  <h2 className="text-xl font-semibold mb-4">Benefits</h2>
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap">{job.benefits}</p>
                  </div>
                </div>
              </>
            )}

            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <>
                <Separator />
                <div>
                  <h2 className="text-xl font-semibold mb-4">Required Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => (
                      <Badge key={index} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Section */}
            <Card>
              <CardHeader>
                <CardTitle>Apply for this position</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hasApplied ? (
                  <div className="text-center py-4">
                    <div className="text-green-600 mb-2">✓</div>
                    <p className="font-medium">Application Submitted</p>
                    <p className="text-sm text-muted-foreground">
                      You have already applied for this position
                    </p>
                  </div>
                ) : (
                  <Button 
                    onClick={handleApply} 
                    disabled={applying}
                    className="w-full"
                    size="lg"
                  >
                    {applying ? "Applying..." : "Apply Now"}
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={saveJob}
                  className="w-full"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Save Job
                </Button>
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle>About {job.companies?.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {job.companies?.description && (
                  <p className="text-sm text-muted-foreground">
                    {job.companies.description}
                  </p>
                )}
                
                <div className="space-y-2 text-sm">
                  {job.companies?.industry && (
                    <div>
                      <span className="font-medium">Industry: </span>
                      {job.companies.industry}
                    </div>
                  )}
                  {job.companies?.size_range && (
                    <div>
                      <span className="font-medium">Company Size: </span>
                      {job.companies.size_range} employees
                    </div>
                  )}
                  {job.companies?.location && (
                    <div>
                      <span className="font-medium">Location: </span>
                      {job.companies.location}
                    </div>
                  )}
                </div>

                {job.companies?.website_url && (
                  <Button variant="outline" className="w-full" asChild>
                    <a 
                      href={job.companies.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visit Website
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default JobDetail;