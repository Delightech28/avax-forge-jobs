import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
// Using Express API instead of Supabase
import { useAuth } from "@/hooks/useAuth";
import { db } from '@/integrations/firebase/client';
import { doc, getDoc, setDoc, getDocs, collection, Timestamp, where, query } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  // ...removed token compensation field...
  // ...removed token amount field...
  requires_wallet: boolean;
  created_at: string;
  expires_at?: string;
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
  companyId?: string;
}

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [saved, setSaved] = useState(false);
  // Check if job is already saved
  useEffect(() => {
    const checkSaved = async () => {
      if (!user || !job?.id) return;
      try {
        const savedRef = doc(db, 'users', user.id as string, 'saved_jobs', 'list');
        const savedSnap = await getDoc(savedRef);
        if (savedSnap.exists()) {
          const data = savedSnap.data();
          setSaved((data.jobIds || []).includes(job.id));
        }
      } catch {
        // Ignore errors when checking saved jobs
      }
    };
    checkSaved();
  }, [user, job?.id]);

  // import { useCallback } from "react"; // moved to top

  const fetchJob = useCallback(async () => {
    try {
      const snap = await getDoc(doc(db, 'jobs', id as string));
      if (!snap.exists()) throw new Error('Not found');
      const j = snap.data() as JobDetail;
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
        requires_wallet: j.requires_wallet,
        created_at: j.created_at,
        expires_at: j.expires_at,
        companies: j.companies || {
          id: "",
          name: "",
          description: "",
          logo_url: "",
          website_url: "",
          location: "",
          size_range: "",
          industry: ""
        },
        companyId: j.companyId,
        // company_id: j.company_id, // Removed because not in JobDetail interface
        // posted_by: j.posted_by,   // Remove or add to interface if needed
      });
    } catch (error) {
      console.error("Error fetching job:", error);
      toast.error("Job not found");
      if (user?.role === 'company') {
        navigate("/");
      } else {
        navigate("/jobs");
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate, user?.role]);

  const checkApplicationStatus = useCallback(async () => {
    if (!user || !id) return;
    try {
      const appRef = doc(db, 'users', user.id, 'applied_jobs', id);
      const appSnap = await getDoc(appRef);
      if (appSnap.exists()) {
        setHasApplied(true);
      } else {
        setHasApplied(false);
      }
    } catch (err) {
      setHasApplied(false);
    }
  }, [id, user]);

  useEffect(() => {
    if (id) {
      fetchJob();
      checkApplicationStatus();
    }
  }, [id, user, fetchJob, checkApplicationStatus]);

  const handleApply = async () => {
    if (job?.expires_at && new Date(job.expires_at).getTime() <= Date.now()) {
      toast.error('This job has expired.');
      return;
    }
    if (!user) {
      toast.error("Please sign in to apply for jobs");
      navigate("/auth");
      return;
    }
    if (job?.requires_wallet && !user.walletAddress) {
      toast.error('This job requires a connected Web3 wallet.');
      navigate('/profile');
      return;
    }

    // Application limiting for non-verified users
    const verifiedPlans = ["ProMonthly", "EliteMonthly", "ProAnnual", "EliteAnnual"];
    if (!verifiedPlans.includes(user.verified || "")) {
      // Only for Basic users
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const appsRef = collection(db, 'users', user.id, 'applied_jobs');
      const q = query(appsRef, where('appliedAt', ">=", Timestamp.fromDate(monthStart)));
      const snap = await getDocs(q);
      if (snap.size >= 2) {
        toast.error('You have reached your monthly limit of 2 job applications. Upgrade to apply for more jobs.');
        return;
      }
    }

    setApplying(true);
    try {
      // Store application in Firestore under applied_jobs subcollection
      const appRef = doc(db, 'users', user.id, 'applied_jobs', job.id);
      await setDoc(appRef, {
        jobId: job.id,
        appliedAt: Timestamp.now(),
        status: 'submitted',
      });
      // Send in-app notification to company
      const companyId = job.companyId || (job.companies && job.companies.id);
      console.log('[Apply] companyId for notification (companyId|company_id|posted_by|companies.id):', companyId);
      if (companyId) {
        try {
          await setDoc(doc(collection(db, 'notifications')), {
            userId: companyId,
            type: 'job_application',
            category: 'job_application',
            jobId: job.id,
            applicantId: user.id,
            createdAt: Timestamp.now(),
            message: `You have a new application for your job: ${job.title}`,
            read: false,
          });
          console.log('[Apply] Notification written for userId:', companyId);
        } catch (notifErr) {
          console.error('[Apply] Error writing notification:', notifErr);
        }
      } else {
        console.warn('[Apply] No companyId found for notification.');
      }
      setHasApplied(true);
      // Re-check application status from Firestore to ensure UI stays correct after refresh
      await checkApplicationStatus();
      toast.success('Application submitted successfully!');
    } catch (error: unknown) {
      console.error('[Apply] Error submitting application:', error);
      toast.error('Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const saveJob = async () => {
    if (!user || !job?.id) {
      toast.error("Please sign in to save jobs");
      return;
    }
    try {
      const savedRef = doc(db, 'users', user.id as string, 'saved_jobs', 'list');
      const savedSnap = await getDoc(savedRef);
      let jobIds = [];
      if (savedSnap.exists()) {
        jobIds = savedSnap.data().jobIds || [];
      }
      if (!saved) {
        // Save job
        await setDoc(savedRef, { jobIds: [...jobIds, job.id] }, { merge: true });
        setSaved(true);
        toast.success('Job saved successfully!');
      } else {
        // Unsave job
        const updatedJobIds = jobIds.filter((jid: string) => jid !== job.id);
        await setDoc(savedRef, { jobIds: updatedJobIds }, { merge: true });
        setSaved(false);
        toast.success('Job removed from saved jobs');
      }
    } catch (error: unknown) {
      toast.error('Failed to update saved jobs');
    }
  };

  const formatSalary = (min: number, max: number, currency: string) => {
    if (!min && !max) return "Salary not specified";
    // Only show the numbers, no currency except USD
    if (min && max) {
      return `${min} - ${max}`;
    }
    return `${min || max}`;
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

  const isExpired = job?.expires_at && new Date(job.expires_at).getTime() <= Date.now();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Only show Back to Jobs for non-company users; company users see Home button */}
        {user?.role === 'company' ? (
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        ) : (
          <Button 
            variant="ghost" 
            onClick={() => navigate("/jobs")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
        )}

  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                    {job.title}
                    {isExpired && (
                      <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">Expired</span>
                    )}
                  </h1>
                  <div className="flex items-center gap-4 text-lg text-muted-foreground">
                    <span className="font-medium text-foreground text-base lg:text-lg">{job.companies?.name}</span>
                    {job.companies?.location && (
                      <span className="flex items-center gap-1 text-sm lg:text-base">
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
                  className={saved ? "text-red-500" : "text-muted-foreground hover:text-foreground"}
                  aria-label={saved ? "Saved" : "Save Job"}
                >
                  <Heart className={`h-5 w-5 ${saved ? "fill-current text-red-500" : ""}`} />
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
          {/* Token compensation removed */}
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
                    disabled={applying || (job.requires_wallet && !user?.walletAddress) || isExpired}
                    className="w-full"
                    size="lg"
                    title={
                      isExpired ? 'This job has expired.' :
                      (job.requires_wallet && !user?.walletAddress) ? 'This job requires a connected Web3 wallet.' : undefined
                    }
                  >
                    {applying ? "Applying..." : (job.requires_wallet && !user?.walletAddress) ? "Wallet Required" : "Apply Now"}
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={saveJob}
                  className={`w-full ${saved ? "border-red-500 text-red-500" : ""}`}
                  title={job.requires_wallet && !user?.walletAddress ? 'This job requires a connected Web3 wallet.' : undefined}
                >
                  <Heart className={`h-4 w-4 mr-2 ${saved ? "fill-current text-red-500" : ""}`} />
                  {saved ? "Saved" : "Save Job"}
                </Button>
              </CardContent>
            </Card>


          </div>
        </div>
      </main>
    </div>
  );
};

export default JobDetail;