import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '@/integrations/firebase/client';
import { doc, onSnapshot } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator'; // Adjust the path based on your project structure
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Users, Globe, Shield, MessageCircle, DollarSign } from '@/components/ui/icons';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import { MapPin, Calendar, Briefcase, BookOpen, Award, LogOut, Copy, Check } from 'lucide-react';
interface Experience {
  title: string;
  company: string;
  period: string;
  description?: string;
}

interface Education {
  degree: string;
  school: string;
  period: string;
  description?: string;
}

interface Certification {
  title: string;
  issuer: string;
  date: string;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
}

interface User {
  id: string;
  fullName?: string;
  email?: string;
  avatar?: string;
  walletAddress?: string;
  bio?: string;
  location?: string;
  skills?: string[];
  experience?: Experience[];
  education?: Education[];
  certifications?: Certification[];
  verified?: boolean;
  profileComplete?: number;
  applications?: number;
  subscriptionStatus?: string;
  subscriptionExpires?: string;
  createdAt?: string | number;
}

const UserProfile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    const userRef = doc(db, 'users', userId);
    const unsub = onSnapshot(userRef, (userSnap) => {
      if (userSnap.exists()) {
        const data = userSnap.data();
        // Check verified status (string or boolean)
        let verified = false;
        if (typeof data.verified === 'boolean') {
          verified = data.verified;
        } else if (typeof data.verified === 'string') {
          // Accept 'true', 'verified', or subscription plan names
          verified = ['true', 'verified', 'ProMonthly', 'ProAnnual', 'EliteMonthly', 'EliteAnnual'].includes(data.verified);
        }
  setUser({ id: userSnap.id, ...data, verified, createdAt: data.createdAt });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found.</div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6 relative">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-2xl">
                  {user.fullName?.charAt(0) || user.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold flex items-center gap-2">
                    {user.fullName || user.email || 'User Profile'}
                    {user.verified && (
                      <span className="flex items-center gap-1 border border-blue-600 rounded-full px-3 py-1 bg-blue-50">
                        <Shield className="h-4 w-4 text-blue-600" />
                        <span className="text-blue-600 font-medium text-xs">Verified</span>
                      </span>
                    )}
                  </h1>
                </div>
                <p className="text-base text-muted-foreground mb-4 max-w-2xl">{user.bio || 'No bio added yet.'}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {user.email && (
                    <span className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {user.email}
                    </span>
                  )}
                  {user.location && (
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {user.location}
                    </span>
                  )}
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Member Since {(() => {
                      if (user.createdAt) {
                        const date = new Date(user.createdAt);
                        if (!isNaN(date.getTime())) {
                          return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
                        }
                      }
                      return 'Recently';
                    })()}
                  </span>
                </div>
                <div className='mt-3'>
                {user.walletAddress && (
                  <div className="text-xs mt-1 flex flex-col md:flex-row md:items-center gap-2">
                    <div className="flex items-center gap-2">
                      Wallet: <span className="font-mono">{user.walletAddress}</span>
                      <button
                        type="button"
                        className="ml-1 p-1 rounded hover:bg-muted transition"
                        onClick={() => {
                          navigator.clipboard.writeText(user.walletAddress || '');
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        aria-label={copied ? 'Copied!' : 'Copy wallet address'}
                      >
                        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    <Button
                      variant="default"
                      className="w-full md:w-auto md:ml-4 flex items-center gap-2 shadow-lg"
                      onClick={() => window.location.href = `/messages?to=${user.id}`}
                    >
                      <MessageCircle className="h-4 w-4" />
                      Send Message
                    </Button>
                  </div>
                )}
              </div>
              </div>
            </div>
            {/* Send Message Button moved under wallet address for mobile view */}
          </CardContent>
        </Card>
        <div className="space-y-6">
          {/* Skills & Technologies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Skills & Technologies
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.skills && user.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No skills added yet.</p>
              )}
            </CardContent>
          </Card>
          {/* Professional Experience */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Professional Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {user.experience && user.experience.length > 0 ? (
                user.experience.map((exp, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{exp.title}</h3>
                        <p className="text-muted-foreground">{exp.company}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">{exp.period}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{exp.description}</p>
                    {index < user.experience.length - 1 && <Separator />}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No experience added yet.</p>
              )}
            </CardContent>
          </Card>
          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {user.education && user.education.length > 0 ? (
                user.education.map((edu, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{edu.degree}</h3>
                        <p className="text-muted-foreground">{edu.school}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">{edu.period}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{edu.description}</p>
                    {index < user.education.length - 1 && <Separator />}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No education added yet.</p>
              )}
            </CardContent>
          </Card>
          {/* Certifications card directly under Education */}
          {user.certifications && user.certifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Certifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {user.certifications.map((c, i) => (
                  <div key={i} className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <Award className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <div className="font-semibold">{c.title}</div>
                        <div className="text-sm text-muted-foreground">{c.issuer} • {c.date}</div>
                        {c.description && <div className="text-sm mt-1">{c.description}</div>}
                        {c.credentialUrl && (
                          <a className="text-sm text-primary underline inline-flex items-center gap-1" href={c.credentialUrl} target="_blank" rel="noreferrer">
                            View credential
                          </a>
                        )}
                      </div>
                    </div>
                    {i < (user.certifications.length - 1) && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
