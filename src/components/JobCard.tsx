import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { MapPin, Clock, DollarSign, Shield, Building } from "lucide-react";

interface JobCardProps {
  job: {
    id: string;
    title: string;
    company: string;
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

const JobCard = ({ job, isFeatured = false }: JobCardProps) => {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 glass-card border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-primary/20 to-primary-glow/20 rounded-lg flex items-center justify-center overflow-hidden">
              {job.logo_url ? (
                <img src={job.logo_url} alt={job.company} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <Building className="h-6 w-6 text-primary" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                {job.title}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">Posted by</span>
                <span className="text-foreground/70 text-sm font-medium">{job.company}</span>
                {job.isVerified && (
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
            <a href={isFeatured ? undefined : `/jobs/${job.id}?apply=1`}>Apply Now</a>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default JobCard;