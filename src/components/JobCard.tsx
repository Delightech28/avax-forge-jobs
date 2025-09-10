import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { doc, setDoc, getDoc, getDocs, collection, Timestamp, where, query } from 'firebase/firestore';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { MapPin, Clock, DollarSign, Shield, Building } from "lucide-react";
import { Link } from "react-router-dom";
import { db } from '@/integrations/firebase/client';

interface JobCardProps {
  job: {
    id: string;
    title: string;
  company: string;
  companyId?: string | null;
    location: string;
    type: string;
    salary: string;
    postedAt: string;
    isVerified: boolean;
    tags: string[];
    description: string;
    logo_url?: string;
  };
  isFeatured?: boolean;
}

// Simple in-memory cache for company verification status to avoid repeated reads
const companyVerificationCache: Record<string, boolean> = {};

const JobCard = ({ job, isFeatured = false }: JobCardProps) => {
  const { user } = useAuth();
  const [companyVerified, setCompanyVerified] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    const companyId = job.companyId;
    if (!companyId) {
      setCompanyVerified(null);
      return;
    }

    // If cached, use it
    if (companyVerificationCache[companyId] !== undefined) {
      setCompanyVerified(companyVerificationCache[companyId]);
      return;
    }

    type CompanyLike = {
      isVerified?: boolean;
      is_verified?: boolean;
      verified?: boolean | string;
      verifiedLevel?: string;
      verified_plan?: string;
      [key: string]: unknown;
    };
    (async () => {
      try {
        const compRef = doc(db, 'companies', companyId);
        const snap = await getDoc(compRef);
        let verified = false;
        const verifiedPlans = ['ProMonthly', 'ProAnnual', 'EliteMonthly', 'EliteAnnual'];
        if (snap.exists()) {
          const data = snap.data() as CompanyLike;
          verified = !!(
            data.isVerified ||
            data.is_verified ||
            data.verified === true ||
            (typeof data.verified === 'string' && verifiedPlans.includes(data.verified)) ||
            (typeof data.verifiedLevel === 'string' && verifiedPlans.includes(data.verifiedLevel)) ||
            (typeof data.verified_plan === 'string' && verifiedPlans.includes(data.verified_plan))
          );
        }

        // If not verified from companies collection, also try users collection (some apps store company profile under users)
        if (!verified) {
          try {
            const userRef = doc(db, 'users', companyId);
            const uSnap = await getDoc(userRef);
            if (uSnap.exists()) {
              const udata = uSnap.data() as CompanyLike;
              verified = !!(
                udata.verified === true ||
                udata.isVerified ||
                udata.is_verified ||
                (typeof udata.verified === 'string' && verifiedPlans.includes(udata.verified)) ||
                (typeof udata.verifiedLevel === 'string' && verifiedPlans.includes(udata.verifiedLevel)) ||
                (typeof udata.verified_plan === 'string' && verifiedPlans.includes(udata.verified_plan))
              );
            }
          } catch (err) {
            // ignore user lookup errors
          }
        }
        companyVerificationCache[companyId] = verified;
        if (mounted) setCompanyVerified(verified);
      } catch (err) {
        // don't show verified on error
        companyVerificationCache[companyId] = false;
        if (mounted) setCompanyVerified(false);
      }
    })();

    return () => { mounted = false; };
  }, [job.companyId]);
  // Debug info to help trace why badges appear
  useEffect(() => {
  console.debug('[JobCard] companyId:', job.companyId, 'job.isVerified:', job.isVerified, 'companyVerified:', companyVerified);
  }, [job.companyId, job.isVerified, companyVerified]);
  // Handler for job view limiting
  const handleApplyClick = async (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (!user) return; // Let auth logic handle redirect
    const verifiedPlans = ["ProMonthly", "EliteMonthly", "ProAnnual", "EliteAnnual"];
    if (verifiedPlans.includes(user.verified || "")) return; // Unlimited for verified

    // Only for Basic users
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const viewsRef = collection(db, 'users', user.id, 'job_views');
    const q = query(viewsRef, where('viewedAt', ">=", Timestamp.fromDate(monthStart)));
    const snap = await getDocs(q);
    if (snap.size >= 5) {
      e.preventDefault();
      toast.error('You have reached your monthly limit of 5 job views. Upgrade to view more jobs.');
      return;
    }
    // Record this view
    await setDoc(doc(viewsRef, job.id), {
      jobId: job.id,
      viewedAt: Timestamp.now(),
    });
    // Allow navigation
  };

  return (
    <>
      <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 glass-card border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-primary/20 to-primary-glow/20 rounded-lg flex items-center justify-center overflow-hidden">
                {job.companyId ? (
                  <Link to={`/company/${job.companyId}`} className="block w-full h-full">
                    {job.logo_url ? (
                      <img src={job.logo_url} alt={job.company} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <Building className="h-6 w-6 text-muted-foreground" />
                    )}
                  </Link>
                ) : (
                  <Building className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-1">{job.title}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">Posted by</span>
                  <Link
                    to={`/company/${job.companyId ? job.companyId : encodeURIComponent(job.company)}`}
                    className="text-foreground/70 text-sm font-medium hover:text-primary"
                  >
                    {job.company}
                  </Link>
                  {(companyVerified === true) && (
                    <span className="flex items-center gap-1">
                      <Shield className="h-4 w-4 text-primary" />
                      <span className="text-xs text-primary">Verified</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-4">
          <p className="text-foreground/80 mb-4 line-clamp-2">{job.description}</p>
          <div className="flex flex-wrap gap-2 mb-4">
          {job.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm text-foreground/70">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            {job.location}
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            {job.type}
          </div>
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-2" />
            {/* Remove currency symbol, just show amount/range */}
            {job.salary.replace(/\$|USD|EUR|GBP|CAD/gi, "").trim()}
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            {job.postedAt}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex w-full gap-3">
          {/* Remove View Details button, keep only Apply Now */}
          <Button
            variant="default"
            className="flex-1"
            asChild
            disabled={isFeatured}
          >
            <a
              href={isFeatured ? undefined : `/jobs/${job.id}?apply=1`}
              onClick={handleApplyClick}
            >
              Apply Now
            </a>
          </Button>
        </div>
      </CardFooter>
    </Card>
    </>
  );
};

export default JobCard;