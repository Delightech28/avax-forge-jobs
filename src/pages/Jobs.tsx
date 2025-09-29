import { useState, useEffect, useCallback } from "react";
import JobCard from "@/components/JobCard";
import { useSearchParams } from "react-router-dom";
// Using Express API instead of Supabase
import { useAuth } from "@/hooks/useAuth";
import { db } from '@/integrations/firebase/client';
import { collection, getDocs, query, where, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Clock, DollarSign, Briefcase, Search, Filter, Heart } from "lucide-react";
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
  company_name?: string;
  company_id?: string;
  companyId?: string;
  company_verification?: 'Elite' | 'Pro' | 'Basic';
  posted_by?: string;
}

const Jobs = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [jobType, setJobType] = useState(searchParams.get("type") || "");
  const [locationType, setLocationType] = useState(searchParams.get("location") || "");
  const [experienceLevel, setExperienceLevel] = useState(searchParams.get("experience") || "");
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());


  // Memoized fetchJobs
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const jobsCol = collection(db, 'jobs');
      const filters: import('firebase/firestore').QueryConstraint[] = [];
      if (jobType && jobType !== 'all') filters.push(where('job_type', '==', jobType));
      if (locationType && locationType !== 'all') filters.push(where('location_type', '==', locationType));
      if (experienceLevel && experienceLevel !== 'all') filters.push(where('experience_level', '==', experienceLevel));
      const qy = filters.length ? query(jobsCol, ...filters) : query(jobsCol);
      const snap = await getDocs(qy);
      const list = await Promise.all(snap.docs.map(async (d) => {
        const j = d.data() as Job;
        let company_verification: 'Elite' | 'Pro' | 'Basic' = 'Basic';
        let company_name = j.company_name || undefined;
        if (j.companyId || j.company_id) {
          try {
            const companyDocId = j.companyId || j.company_id;
            // Only check users collection, since both companies and users are stored there
            const userRef = doc(db, 'users', companyDocId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const userData = userSnap.data();
              if (userData.fullName) company_name = userData.fullName;
              // Map all Pro/Elite variants to 'Pro' or 'Elite'
              if (typeof userData.verified === 'string') {
                if (userData.verified.startsWith('Elite')) company_verification = 'Elite';
                else if (userData.verified.startsWith('Pro')) company_verification = 'Pro';
              }
            }
          } catch {
            // Suppress error if user document is missing or inaccessible
          }
        }
        // Guarantee company_verification is always set
        if (!company_verification) company_verification = 'Basic';
        return {
          id: d.id,
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
          token_compensation: j.token_compensation,
          token_amount: j.token_amount,
          requires_wallet: j.requires_wallet,
          created_at: j.created_at,
          expires_at: j.expires_at,
          company_name,
          company_verification,
          companyId: j.companyId || j.company_id || j.posted_by || null,
        } as Job;
      }));
      // Debug: log all company_verification values
      console.log('Job company_verification values:', list.map(j => ({ id: j.id, company_verification: j.company_verification })));
      const now = Date.now();
      const notExpired = list.filter((j) => !j.expires_at || new Date(j.expires_at).getTime() > now);
      let filtered = searchTerm
        ? notExpired.filter((j) =>
            [j.title, j.description, j.location, j.company_name]
              .filter(Boolean)
              .some((t: string | undefined) => String(t).toLowerCase().includes(searchTerm.toLowerCase()))
          )
        : notExpired;
      // Sorting logic for job seekers
      if (user && (user.verified === 'ProMonthly' || user.verified === 'EliteMonthly' || user.verified === 'ProAnnual' || user.verified === 'EliteAnnual')) {
        // Verified job seeker: Elite > Pro > Basic, each group sorted by created_at descending
        const sortByDate = (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        filtered = [
          ...filtered.filter(j => j.company_verification === 'Elite').sort(sortByDate),
          ...filtered.filter(j => j.company_verification === 'Pro').sort(sortByDate),
          ...filtered.filter(j => j.company_verification === 'Basic').sort(sortByDate),
        ];
      } else {
        // Basic job seeker: shuffle all
        for (let i = filtered.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
        }
      }
      setJobs(filtered);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      if (!(error instanceof Error && error.message.includes('Missing or insufficient permissions'))) {
        toast.error("Failed to fetch jobs");
      }
    } finally {
      setLoading(false);
    }
  }, [jobType, locationType, experienceLevel, searchTerm, user]);

  // Fetch saved jobs (must be declared before use in useEffect)
  const fetchSavedJobs = useCallback(async () => {
    if (!user) return;
    try {
      const savedRef = doc(db, 'users', user.id as string, 'saved_jobs', 'list');
      const savedSnap = await getDoc(savedRef);
      if (savedSnap.exists()) {
        const data = savedSnap.data();
        setSavedJobs(new Set(data.jobIds || []));
      }
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    }
  }, [user]);

  // Auto-apply filters and search
  useEffect(() => {
    fetchJobs();
    if (user) {
      fetchSavedJobs();
    }
  }, [searchTerm, jobType, locationType, experienceLevel, user, fetchJobs, fetchSavedJobs]);

  const saveJob = async (jobId: string) => {
    if (!user) {
      toast.error("Please sign in to save jobs");
      return;
    }

    try {
      const savedRef = doc(db, 'users', user.id as string, 'saved_jobs', 'list');
      const isCurrentlySaved = savedJobs.has(jobId);
      
      if (isCurrentlySaved) {
        // Remove from saved
        const updatedJobIds = Array.from(savedJobs).filter(id => id !== jobId);
        await setDoc(savedRef, { jobIds: updatedJobIds }, { merge: true });
        setSavedJobs(new Set(updatedJobIds));
        toast.success("Job removed from saved jobs");
      } else {
        // Add to saved
        const updatedJobIds = Array.from(savedJobs).concat(jobId);
        await setDoc(savedRef, { jobIds: updatedJobIds }, { merge: true });
        setSavedJobs(new Set(updatedJobIds));
        toast.success("Job saved successfully");
      }
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error("Failed to save job");
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (jobType && jobType !== "all") params.set("type", jobType);
    if (locationType && locationType !== "all") params.set("location", locationType);
    if (experienceLevel && experienceLevel !== "all") params.set("experience", experienceLevel);
    
    setSearchParams(params);
  };

  const formatSalary = (min: number, max: number, currency: string) => {
    if (!min && !max) return "Salary not specified";
    // Only show the numbers, no currency
    if (min && max) {
      return `${min} - ${max}`;
    }
    return `${min || max}`;
  };

  // Format posted time
  const formatPostedAt = (created_at: string) => {
    if (!created_at) return "";
    const now = Date.now();
    const created = new Date(created_at).getTime();
    const diffMs = now - created;
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return "just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} min${diffMin > 1 ? "s" : ""} ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} hr${diffHr > 1 ? "s" : ""} ago`;
    const diffDay = Math.floor(diffHr / 24);
    return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search jobs, companies, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full"
              />
            </div>
            <Button onClick={handleSearch} className="md:w-auto">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          <div className="flex flex-wrap gap-4">
            <Select value={jobType} onValueChange={setJobType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="full_time">Full Time</SelectItem>
                <SelectItem value="part_time">Part Time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
                <SelectItem value="freelance">Freelance</SelectItem>
              </SelectContent>
            </Select>

            <Select value={locationType} onValueChange={setLocationType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="on_site">On-site</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>

            <Select value={experienceLevel} onValueChange={setExperienceLevel}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="entry">Entry Level</SelectItem>
                <SelectItem value="mid">Mid Level</SelectItem>
                <SelectItem value="senior">Senior</SelectItem>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="executive">Executive</SelectItem>
              </SelectContent>
            </Select>

            {(jobType && jobType !== "all" || locationType && locationType !== "all" || experienceLevel && experienceLevel !== "all" || searchTerm) && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setJobType("all");
                  setLocationType("all");
                  setExperienceLevel("all");
                  setSearchParams(new URLSearchParams());
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-muted-foreground">
            {loading ? "Loading..." : `${jobs.length} jobs found`}
          </p>
        </div>

        {/* Job Listings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
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
            ))
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria</p>
            </div>
          ) : (
            jobs.map((job) => (
              <JobCard
                key={job.id}
                job={{
                  id: job.id,
                  title: job.title,
                  company: job.company_name || "",
                  companyId: job.companyId || job.company_id || job.posted_by || null,
                  location: job.location,
                  type: job.job_type.replace("_", " "),
                  salary: formatSalary(job.salary_min, job.salary_max, job.salary_currency),
                  postedAt: formatPostedAt(job.created_at),
                  isVerified: job.company_verification === 'Elite' || job.company_verification === 'Pro',
                  tags: job.skills || [],
                  description: job.description,
                }}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
export default Jobs;