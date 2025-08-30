import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { db } from '@/integrations/firebase/client';
import { collection, getDocs, query, where, doc, getDoc, setDoc } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Clock, DollarSign, Briefcase, Heart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";

interface Job {
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
  token_compensation: string;
  token_amount: number;
  requires_wallet: boolean;
  created_at: string;
  expires_at?: string;
  companies: {
    id: string;
    name: string;
    logo_url: string;
    location: string;
  };
}

const SavedJobs = () => {
  const { user } = useAuth();
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());

  // import { useCallback } from "react"; // Moved to top

  const fetchSavedJobs = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get saved job IDs
      const savedRef = doc(db, 'users', user.id as string, 'saved_jobs', 'list');
      const savedSnap = await getDoc(savedRef);
      
      if (!savedSnap.exists()) {
        setSavedJobs([]);
        setSavedJobIds(new Set());
        return;
      }

      const data = savedSnap.data();
      const jobIds = data.jobIds || [];
      setSavedJobIds(new Set(jobIds));

      if (jobIds.length === 0) {
        setSavedJobs([]);
        return;
      }

      // Fetch job details for each saved job ID
      const jobsCol = collection(db, 'jobs');
      const jobsData: Job[] = [];

      for (const jobId of jobIds) {
        try {
          const jobRef = doc(db, 'jobs', jobId);
          const jobSnap = await getDoc(jobRef);
          
          if (jobSnap.exists()) {
            const jobData = jobSnap.data() as Job;
            jobsData.push({
              id: jobSnap.id,
              title: jobData.title,
              description: jobData.description,
              job_type: jobData.job_type,
              location_type: jobData.location_type,
              location: jobData.location,
              salary_min: jobData.salary_min,
              salary_max: jobData.salary_max,
              salary_currency: jobData.salary_currency,
              experience_level: jobData.experience_level,
              skills: jobData.skills || [],
              token_compensation: jobData.token_compensation,
              token_amount: jobData.token_amount,
              requires_wallet: jobData.requires_wallet,
              created_at: jobData.created_at,
              expires_at: jobData.expires_at,
              companies: jobData.companies || undefined,
            });
          }
        } catch (error) {
          console.error(`Error fetching job ${jobId}:`, error);
        }
      }

      setSavedJobs(jobsData);
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
      toast.error("Failed to load saved jobs");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchSavedJobs();
    } else {
      setLoading(false);
    }
  }, [user, fetchSavedJobs]);

  const removeFromSaved = async (jobId: string) => {
    if (!user) return;

    try {
      const updatedJobIds = Array.from(savedJobIds).filter(id => id !== jobId);
      const savedRef = doc(db, 'users', user.id as string, 'saved_jobs', 'list');
      await setDoc(savedRef, { jobIds: updatedJobIds }, { merge: true });
      
      setSavedJobIds(new Set(updatedJobIds));
      setSavedJobs(prev => prev.filter(job => job.id !== jobId));
      toast.success("Job removed from saved jobs");
    } catch (error) {
      console.error('Error removing job:', error);
      toast.error("Failed to remove job");
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

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sign in to view saved jobs</h3>
            <p className="text-muted-foreground">Please sign in to access your saved jobs</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Saved Jobs</h1>
          <p className="text-muted-foreground">
            {loading ? "Loading..." : `${savedJobs.length} saved job${savedJobs.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {loading ? (
          <div className="grid gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="space-y-2">
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : savedJobs.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No saved jobs yet</h3>
            <p className="text-muted-foreground mb-4">
              Start browsing jobs and save the ones you're interested in
            </p>
            <Button asChild>
              <a href="/jobs">Browse Jobs</a>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6">
            {savedJobs.map((job) => {
              const isExpired = job.expires_at && new Date(job.expires_at).getTime() < Date.now();
              
              return (
                <Card key={job.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 flex items-center gap-2">
                          {job.title}
                          {isExpired && (
                            <Badge variant="destructive" className="text-xs">
                              Expired
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 text-base">
                          <span className="font-medium">{job.companies?.name}</span>
                          {job.companies?.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {job.companies.location}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromSaved(job.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        title="Remove from saved"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground line-clamp-2">{job.description}</p>

                    <div className="flex flex-wrap gap-2">
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
                        <Badge variant="outline" className="border-primary text-primary" title="Wallet connection required to apply">
                          Wallet Required
                        </Badge>
                      )}
                    </div>

                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {job.skills.slice(0, 5).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {job.skills.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.skills.length - 5} more
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        {(job.salary_min || job.salary_max) && (
                          <p className="flex items-center gap-1 text-sm font-medium">
                            <DollarSign className="h-4 w-4" />
                            {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
                          </p>
                        )}
                      {/* Token compensation removed */}
                      </div>
                      <p className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {new Date(job.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Button asChild className="w-full" disabled={isExpired}>
                      <a href={`/jobs/${job.id}`}>
                        {isExpired ? 'Job Expired' : 'View Details'}
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default SavedJobs;
