import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shield, ExternalLink, Linkedin } from 'lucide-react';

type Company = {
  companyName?: string;
  name?: string;
  displayName?: string;
  fullName?: string;
  industry?: string;
  aboutCompany?: string;
  website?: string;
  websites?: string[];
  logo_url?: string;
  isVerified?: boolean;
  focus?: string;
  companyFocus?: string;
  verified?: string | boolean;
  verifiedLevel?: string;
  verified_plan?: string;
  is_verified?: boolean;
  companyLogo?: string;
  avatar?: string;
  contactEmail?: string;
  twitter?: string;
  linkedin?: string;
  discord?: string;
  locationPolicy?: string;
  companySize?: string;
  visionCulture?: string;
  description?: string;
};

const CompanyProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const ref = doc(db, 'companies', id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setCompany(snap.data());
        } else {
          // Fallback: try users collection in case companies are stored as users
          const userRef = doc(db, 'users', id);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            if (userData.role === 'company') {
              setCompany(userData);
              return;
            }
          }
          // If `id` looks like an encoded name, try searching companies by name
          const decoded = decodeURIComponent(id);
          try {
            const companiesRef = collection(db, 'companies');
            const q = query(companiesRef, where('companyName', '==', decoded));
            const qsnap = await getDocs(q);
            if (!qsnap.empty) {
              setCompany(qsnap.docs[0].data());
            } else {
              // search users by fullName or companyName
              const usersRef = collection(db, 'users');
              const qu = query(usersRef, where('companyName', '==', decoded));
              const uSnap = await getDocs(qu);
              if (!uSnap.empty) {
                const userData = uSnap.docs[0].data();
                if (userData.role === 'company') setCompany(userData);
              }
            }
          } catch (err) {
            // ignore search errors
          }
        }
      } catch (err) {
        console.error('Failed to load company profile', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="text-center">Loading...</div>
      </main>
    </div>
  );

  if (!company) return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="text-center">Company not found</div>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                {company.avatar || company.logo_url || company.companyLogo ? (
                  <AvatarImage src={company.avatar || company.logo_url || company.companyLogo} />
                ) : (
                  <AvatarFallback className="text-lg">{(company.companyName || company.name || company.displayName || company.fullName || '').charAt(0)}</AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2 m-0 text-xl">
                  {company.companyName || company.name || company.displayName || company.fullName || 'Company'}
                  {(() => {
                    const verifiedPlans = ['ProMonthly', 'ProAnnual', 'EliteMonthly', 'EliteAnnual'];
                    const isVerifiedFlag = !!(
                      company.isVerified ||
                      company.is_verified ||
                      company.verified === true ||
                      (typeof company.verified === 'string' && verifiedPlans.includes(company.verified)) ||
                      (typeof company.verifiedLevel === 'string' && verifiedPlans.includes(company.verifiedLevel)) ||
                      (typeof company.verified_plan === 'string' && verifiedPlans.includes(company.verified_plan))
                    );
                    return isVerifiedFlag ? (
                      <Badge variant="default" className="ml-2 inline-flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        <span className="text-xs">Verified</span>
                      </Badge>
                    ) : null;
                  })()}
                </CardTitle>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>About Us (Short Bio)</Label>
                <p className="text-sm text-muted-foreground py-2">{company.aboutCompany || company.description || 'No company bio yet'}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Website</Label>
                  <p className="text-sm text-muted-foreground py-2">{company.website ? (<a href={company.website} target="_blank" rel="noreferrer" className="text-primary underline flex items-center gap-1"><ExternalLink className="h-4 w-4" /> {company.website}</a>) : 'Not set'}</p>
                </div>

                <div>
                  <Label>Contact Email</Label>
                  <p className="text-sm text-muted-foreground py-2">{company.contactEmail || 'Not set'}</p>
                </div>

                <div>
                  <Label>Location</Label>
                  <p className="text-sm text-muted-foreground py-2">{company.locationPolicy || 'Not set'}</p>
                </div>

                <div>
                  <Label>Company Size</Label>
                  <p className="text-sm text-muted-foreground py-2">{company.companySize || 'Not set'}</p>
                </div>

                <div>
                  <Label>Industry</Label>
                  <p className="text-sm text-muted-foreground py-2">{company.industry || 'Not set'}</p>
                </div>

                <div className="md:col-span-2">
                  <Label>Vision & Culture</Label>
                  <p className="text-sm text-muted-foreground py-2">{company.visionCulture || 'Not set'}</p>
                </div>
              </div>

              <div>
                <Label>Social</Label>
                <div className="flex items-center gap-3 py-2">
                  {company.twitter ? (
                    <a href={company.twitter} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                      {/* X/Twitter icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-label="X">
                        <path d="M18.244 3H21l-6.58 7.51L22.5 21h-6.73l-4.27-5.18L6 21H3.244l6.97-7.96L1.5 3h6.86l3.86 4.7L18.244 3Zm-1.18 16h1.92L8.98 5h-1.94l10.02 14Z"/>
                      </svg>
                    </a>
                  ) : null}

                  {company.linkedin ? (
                    <a href={company.linkedin} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                      <Linkedin className="h-5 w-5" />
                    </a>
                  ) : null}

                  {company.discord ? (
                    <a href={company.discord} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-label="Discord">
                        <path d="M20.317 4.369A19.791 19.791 0 0 0 16.885 3.1a.486.486 0 0 0-.518.243c-.211.375-.444.864-.608 1.249a18.524 18.524 0 0 0-5.518 0c-.164-.385-.397-.874-.608-1.249a.486.486 0 0 0-.518-.243c-1.432.326-2.814.812-4.112 1.269A.478.478 0 0 0 2 5.77c-1.1 2.042-1.75 4.29-1.75 6.6 0 7.5 6.5 10.5 12.75 10.5s12.75-3 12.75-10.5c0-2.31-.65-4.558-1.75-6.6a.478.478 0 0 0-.433-.401ZM8.02 15.27c-1.18 0-2.15-1.08-2.15-2.41 0-1.33.96-2.41 2.15-2.41s2.15 1.08 2.15 2.41c0 1.33-.96 2.41-2.15 2.41Zm7.96 0c-1.18 0-2.15-1.08-2.15-2.41 0-1.33.96-2.41 2.15-2.41s2.15 1.08 2.15 2.41c0 1.33-.96 2.41-2.15 2.41Z"/>
                      </svg>
                    </a>
                  ) : null}

                  {(!company.twitter && !company.linkedin && !company.discord) && <span className="text-sm text-muted-foreground">Not set</span>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CompanyProfile;
