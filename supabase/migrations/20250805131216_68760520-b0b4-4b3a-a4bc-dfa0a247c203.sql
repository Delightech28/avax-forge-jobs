-- Create enum types for job board
CREATE TYPE public.job_type AS ENUM ('full_time', 'part_time', 'contract', 'internship', 'freelance');
CREATE TYPE public.job_location_type AS ENUM ('remote', 'on_site', 'hybrid');
CREATE TYPE public.application_status AS ENUM ('pending', 'reviewed', 'interview', 'accepted', 'rejected');
CREATE TYPE public.experience_level AS ENUM ('entry', 'mid', 'senior', 'lead', 'executive');

-- Create companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  website_url TEXT,
  logo_url TEXT,
  size_range TEXT, -- e.g., "1-10", "11-50", "51-200", etc.
  industry TEXT,
  location TEXT,
  founded_year INTEGER,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create jobs table
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  posted_by UUID REFERENCES auth.users(id),
  job_type job_type NOT NULL DEFAULT 'full_time',
  location_type job_location_type NOT NULL DEFAULT 'remote',
  location TEXT, -- city, country for on-site/hybrid jobs
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency TEXT DEFAULT 'USD',
  experience_level experience_level NOT NULL DEFAULT 'mid',
  skills TEXT[], -- array of required skills
  requirements TEXT,
  benefits TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- For web3/crypto specific fields
  token_compensation TEXT, -- token symbol if paid in crypto
  token_amount DECIMAL,
  requires_wallet BOOLEAN DEFAULT false
);

-- Create job applications table
CREATE TABLE public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  applicant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cover_letter TEXT,
  resume_url TEXT,
  portfolio_url TEXT,
  status application_status NOT NULL DEFAULT 'pending',
  notes TEXT, -- for employer notes
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one application per user per job
  UNIQUE(job_id, applicant_id)
);

-- Create saved jobs table
CREATE TABLE public.saved_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one save per user per job
  UNIQUE(job_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

-- Companies policies
CREATE POLICY "Anyone can view companies" ON public.companies
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create companies" ON public.companies
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Company creators can update their companies" ON public.companies
  FOR UPDATE TO authenticated
  USING (auth.uid() = created_by);

-- Jobs policies
CREATE POLICY "Anyone can view active jobs" ON public.jobs
  FOR SELECT USING (is_active = true);

CREATE POLICY "Job posters can view their own jobs" ON public.jobs
  FOR SELECT TO authenticated
  USING (auth.uid() = posted_by);

CREATE POLICY "Authenticated users can create jobs" ON public.jobs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = posted_by);

CREATE POLICY "Job posters can update their jobs" ON public.jobs
  FOR UPDATE TO authenticated
  USING (auth.uid() = posted_by);

-- Job applications policies
CREATE POLICY "Applicants can view their own applications" ON public.job_applications
  FOR SELECT TO authenticated
  USING (auth.uid() = applicant_id);

CREATE POLICY "Job posters can view applications for their jobs" ON public.job_applications
  FOR SELECT TO authenticated
  USING (auth.uid() IN (
    SELECT posted_by FROM public.jobs WHERE id = job_id
  ));

CREATE POLICY "Authenticated users can apply to jobs" ON public.job_applications
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Applicants can update their applications" ON public.job_applications
  FOR UPDATE TO authenticated
  USING (auth.uid() = applicant_id);

CREATE POLICY "Job posters can update application status" ON public.job_applications
  FOR UPDATE TO authenticated
  USING (auth.uid() IN (
    SELECT posted_by FROM public.jobs WHERE id = job_id
  ));

-- Saved jobs policies
CREATE POLICY "Users can manage their saved jobs" ON public.saved_jobs
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_jobs_company_id ON public.jobs(company_id);
CREATE INDEX idx_jobs_posted_by ON public.jobs(posted_by);
CREATE INDEX idx_jobs_location_type ON public.jobs(location_type);
CREATE INDEX idx_jobs_job_type ON public.jobs(job_type);
CREATE INDEX idx_jobs_experience_level ON public.jobs(experience_level);
CREATE INDEX idx_jobs_is_active ON public.jobs(is_active);
CREATE INDEX idx_jobs_created_at ON public.jobs(created_at DESC);
CREATE INDEX idx_jobs_skills ON public.jobs USING GIN(skills);

CREATE INDEX idx_applications_job_id ON public.job_applications(job_id);
CREATE INDEX idx_applications_applicant_id ON public.job_applications(applicant_id);
CREATE INDEX idx_applications_status ON public.job_applications(status);

CREATE INDEX idx_saved_jobs_user_id ON public.saved_jobs(user_id);
CREATE INDEX idx_saved_jobs_job_id ON public.saved_jobs(job_id);

-- Create triggers for updated_at
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();