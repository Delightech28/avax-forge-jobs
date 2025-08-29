import { useState, useEffect } from "react";
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
  companies: {
    id: string;
    name: string;
    logo_url: string;
    location: string;
  };
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

  useEffect(() => {
    fetchJobs();
    if (user) {
      fetchSavedJobs();
    }
  }, [searchParams, user]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const jobsCol = collection(db, 'jobs');
      const filters: any[] = [];
      // Basic filtering example; for complex search you'd use Algolia/Meilisearch
      if (jobType && jobType !== 'all') filters.push(where('job_type', '==', jobType));
      if (locationType && locationType !== 'all') filters.push(where('location_type', '==', locationType));
      if (experienceLevel && experienceLevel !== 'all') filters.push(where('experience_level', '==', experienceLevel));
      const qy = filters.length ? query(jobsCol, ...filters) : query(jobsCol);
      const snap = await getDocs(qy);
      const list = snap.docs.map((d) => {
        const j = d.data() as any;
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
          companies: j.company || undefined,
        } as Job;
      });
      // Simple client-side text search
      const now = Date.now();
      const notExpired = list.filter((j) => !j.expires_at || new Date(j.expires_at).getTime() > now);
      const filtered = searchTerm
        ? notExpired.filter((j) =>
            [j.title, j.description, j.location, j.companies?.name]
              .filter(Boolean)
              .some((t: any) => String(t).toLowerCase().includes(searchTerm.toLowerCase()))
          )
        : notExpired;
      setJobs(filtered);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      // Don't show error toast for empty collections - this is normal
      if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
        console.log('No jobs found or permissions issue - this is normal for new installations');
      } else {
      toast.error("Failed to fetch jobs");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedJobs = async () => {
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
  };

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
        <div className="grid gap-6">
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
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
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
                      onClick={() => saveJob(job.id)}
                      className={`hover:text-foreground transition-colors ${
                        savedJobs.has(job.id) 
                          ? 'text-red-500 hover:text-red-600' 
                          : 'text-muted-foreground'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${savedJobs.has(job.id) ? 'fill-current' : ''}`} />
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
                      {job.token_compensation && (
                        <p className="flex items-center gap-1 text-sm text-primary">
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
                          </svg>
                          {job.token_amount} {job.token_compensation}
                        </p>
                      )}
                    </div>
                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {new Date(job.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button asChild className="w-full">
                    <a href={`/jobs/${job.id}`}>View Details</a>
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Jobs;