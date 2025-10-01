import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/integrations/firebase/client';
import { doc, getDoc, onSnapshot, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { WalletSelectModal } from '@/components/ui/wallet-select-modal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  Globe, 
  Github, 
  Linkedin, 
  Music2, 
  ExternalLink,
  Briefcase,
  Award,
  BookOpen,
  Code,
  Download,
  Wallet,
  LogOut
} from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import { useSubscription } from '@/hooks/useSubscription';
import jsPDF from 'jspdf';
// ...existing code...

// ...existing code...
const Profile = () => {
  // Helper to generate and download a styled CV PDF
  const handleDownloadCV = () => {
    const doc = new jsPDF();
    let y = 18;
    // Header: Name & Contact
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(profileData.fullName || 'No Name', 14, y);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const contactLine = [];
    if (user?.email) contactLine.push(user.email);
    if (profileData.contactEmail && profileData.contactEmail !== user?.email) contactLine.push(profileData.contactEmail);
    if (profileData.location) contactLine.push(profileData.location);
    if (profileData.website) contactLine.push(profileData.website.replace(/^https?:\/\//, ''));
    doc.text(contactLine.join(' | '), 14, y + 6);
    y += 12;
    doc.setDrawColor(200);
    doc.line(14, y, 196, y);
    y += 6;

    // OBJECTIVE
    doc.setFillColor(230, 230, 230);
    doc.rect(14, y, 182, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('OBJECTIVE', 16, y + 5);
    y += 11;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    if (profileData.bio) {
      const bioLines = doc.splitTextToSize(profileData.bio, 178);
      doc.text(bioLines, 16, y);
      y += bioLines.length * 5 + 2;
    }

    // EXPERIENCE
    doc.setFillColor(230, 230, 230);
    doc.rect(14, y, 182, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('EXPERIENCE', 16, y + 5);
    y += 11;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    if (profileData.experience && profileData.experience.length > 0) {
      profileData.experience.forEach((exp) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${exp.title}`, 16, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`${exp.company}  ${exp.period}`, 80, y);
        y += 5;
        if (exp.description) {
          const expDesc = doc.splitTextToSize(exp.description, 170);
          doc.text(expDesc, 18, y);
          y += expDesc.length * 5 + 1;
        }
        y += 2;
      });
    }

    // EDUCATION
    doc.setFillColor(230, 230, 230);
    doc.rect(14, y, 182, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('EDUCATION', 16, y + 5);
    y += 11;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    if (profileData.education && profileData.education.length > 0) {
      profileData.education.forEach((edu) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${edu.degree}`, 16, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`${edu.school}  ${edu.period}`, 80, y);
        y += 5;
        if (edu.description) {
          const eduDesc = doc.splitTextToSize(edu.description, 170);
          doc.text(eduDesc, 18, y);
          y += eduDesc.length * 5 + 1;
        }
        y += 2;
      });
    }

    // SKILLS
    doc.setFillColor(230, 230, 230);
    doc.rect(14, y, 182, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('SKILLS', 16, y + 5);
    y += 11;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    if (profileData.skills && profileData.skills.length > 0) {
      const skillsText = profileData.skills.join(', ');
      doc.text(skillsText, 16, y);
      y += 7;
    }

    // CERTIFICATIONS
    if (profileData.certifications && profileData.certifications.length > 0) {
      doc.setFillColor(230, 230, 230);
      doc.rect(14, y, 182, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('CERTIFICATIONS', 16, y + 5);
      y += 11;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      profileData.certifications.forEach((cert) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${cert.title}`, 16, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`${cert.issuer}  ${cert.date || ''}`, 80, y);
        y += 5;
        if (cert.description) {
          const certDesc = doc.splitTextToSize(cert.description, 170);
          doc.text(certDesc, 18, y);
          y += certDesc.length * 5 + 1;
        }
        y += 2;
      });
    }

    // PROJECTS
    if (profileData.projects && profileData.projects.length > 0) {
      doc.setFillColor(230, 230, 230);
      doc.rect(14, y, 182, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('PROJECTS', 16, y + 5);
      y += 11;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      profileData.projects.forEach((proj) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${proj.title}`, 16, y);
        doc.setFont('helvetica', 'normal');
        if (proj.description) {
          const projDesc = doc.splitTextToSize(proj.description, 170);
          doc.text(projDesc, 18, y + 5);
          y += projDesc.length * 5 + 1;
        }
        y += 7;
      });
    }

    doc.save('cv.pdf');
  };
    // ...removed duplicate/old PDF generation code...
  // Helper to shorten wallet address
  const getShortAddress = (addr: string) => {
    if (!addr || addr.length < 10) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // State hooks must be declared before any useEffect that uses them
  // Add missing state for company name editing
  const [isEditingCompanyName, setIsEditingCompanyName] = useState(false);
  const [companyNameInput, setCompanyNameInput] = useState('');
  const [profileData, setProfileData] = useState({
    fullName: '',
    bio: '',
    location: '',
    skills: [] as string[],
    experience: [] as Experience[],
    education: [] as Education[],
    avatar: '',
    walletAddress: '',
    companyName: '',
    companyLogo: '',
    industry: '',
    aboutCompany: '',
    twitter: '',
    linkedin: '',
    discord: '',
    locationPolicy: '',
    companySize: '',
    visionCulture: '',
    contactEmail: '',
    createdAt: null as string | null,
    certifications: [] as Certification[],
    website: '', // Add website property
    projects: [] as Project[], // Add projects property
  });
  // For avatar upload
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Helper: Convert file to base64 string
  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // Handle avatar upload
  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    setUploadingAvatar(true);
    try {
      const base64 = await fileToBase64(file);
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, { avatar: base64 });
      setProfileData(prev => ({ ...prev, avatar: base64 }));
    } catch (err) {
      // Optionally handle error
    } finally {
      setUploadingAvatar(false);
    }
  };
  const [subscribed, setSubscribed] = useState(false);
  const [expirationDate, setExpirationDate] = useState<string | null>(null);
  const [applicationsCount, setApplicationsCount] = useState<number>(0);
  const [walletJustConnected, setWalletJustConnected] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  // Always fetch walletAddress from Firestore on mount and when user changes
  useEffect(() => {
    if (!user || !user.id) return;
    const userRef = doc(db, 'users', user.id);
    const unsub = onSnapshot(userRef, (userSnap) => {
      if (userSnap.exists()) {
          const data = userSnap.data();
          setProfileData(prev => ({
            ...prev,
            fullName: data.fullName || user.fullName || user.email || '',
            bio: data.bio || '',
            location: data.location || '',
            website: data.website || '',
            // prefer websites array when present
            websites: data.websites || (data.website ? [data.website] : []),
            skills: data.skills || [],
            experience: data.experience || [],
            education: data.education || [],
            avatar: data.avatar || '',
            walletAddress: data.walletAddress || '',
            companyName: data.companyName || '',
            companyLogo: data.companyLogo || '',
            industry: data.industry || '',
            aboutCompany: data.aboutCompany || '',
            twitter: data.twitter || '',
            linkedin: data.linkedin || '',
            discord: data.discord || '',
            locationPolicy: data.locationPolicy || '',
            companySize: data.companySize || '',
            visionCulture: data.visionCulture || '',
            contactEmail: data.contactEmail || '',
            certifications: data.certifications || [],
            createdAt: data.createdAt || user.createdAt || null,
          }));

          // Derive applications count from common user-doc fields used across codebases
          const deriveApplicationsFromUserDoc = () => {
            try {
              // 1) applied_jobs (array)
              if (Array.isArray(data.applied_jobs)) return data.applied_jobs.length || 0;
              // 2) appliedJobs (camelCase)
              if (Array.isArray(data.appliedJobs)) return data.appliedJobs.length || 0;
              // 3) applied_jobs as an object/map where keys are jobIds
              if (data.applied_jobs && typeof data.applied_jobs === 'object') return Object.keys(data.applied_jobs).length || 0;
              // 4) explicit counts
              if (typeof data.applied_jobs_count === 'number') return data.applied_jobs_count;
              if (typeof data.appliedJobsCount === 'number') return data.appliedJobsCount;
              // 5) generic applications array
              if (Array.isArray(data.applications)) return data.applications.length || 0;
              // fallback
              return 0;
            } catch (err) {
              return 0;
            }
          };
          const derived = deriveApplicationsFromUserDoc();
          setApplicationsCount(derived || 0);

        // Check for subscription plan and auto-verify
        const plans = ['ProMonthly', 'ProAnnual', 'EliteMonthly', 'EliteAnnual'];
        if (plans.includes(data.verified)) {
          if (!subscribed) setSubscribed(true);
          if (data.subscriptionExpiration) {
            setExpirationDate(new Date(data.subscriptionExpiration * 1000).toLocaleDateString());
          } else if (data.expiration) {
            setExpirationDate(new Date(data.expiration * 1000).toLocaleDateString());
          } else {
            setExpirationDate(null);
          }
        } else {
          if (subscribed) setSubscribed(false);
          setExpirationDate(null);
        }
      } else {
        setProfileData(prev => ({ ...prev, fullName: user.fullName || user.email || prev.fullName }));
      }
    });
    return () => unsub();
  }, [user, subscribed]);

  // Note: applicationsCount is derived from the user document's applied_jobs array when present.
  // If you prefer a separate 'applications' collection listener, we can re-enable that instead.
  
  type Experience = {
    title: string;
    company: string;
    period: string;
    description: string;
  };
  type Education = {
    degree: string;
    school: string;
    period: string;
    description: string;
  };
  type Certification = {
    title: string;
    issuer: string;
    date: string;
    credentialId?: string;
    credentialUrl?: string;
    description?: string;
  };
  type Project = {
    title: string;
    description: string;
  };

  // Subscription hook integration
  const {
    subscribe,
    checkExpiration,
    getPrice,
    expiration,
    activePlan,
    loading: subLoading,
    error: subError,
  } = useSubscription(user?.id, profileData.walletAddress);

  const getWebsiteIcon = (url: string) => {
    const u = (url || '').toLowerCase();
    if (u.includes('github.com')) return <Github className="h-4 w-4" />;
    if (u.includes('linkedin.com')) return <Linkedin className="h-4 w-4" />;
    if (u.includes('x.com') || u.includes('twitter.com')) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="currentColor"
          aria-label="X"
        >
          <path d="M18.244 3H21l-6.58 7.51L22.5 21h-6.73l-4.27-5.18L6 21H3.244l6.97-7.96L1.5 3h6.86l3.86 4.7L18.244 3Zm-1.18 16h1.92L8.98 5h-1.94l10.02 14Z"/>
        </svg>
      );
    }
    if (u.includes('tiktok.com')) return <Music2 className="h-4 w-4" />;
    return <Globe className="h-4 w-4" />;
  };

  const formatJoinDate = (dateString: string) => {
    if (!dateString) return 'Recently';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Recently';
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return 'Recently';
    }
  };

  const calculateProfileCompletion = () => {
    let completedFields = 0;
    let totalFields = 8;
    if (user.role === 'company') {
      totalFields = 4;
      if (profileData.companyName && profileData.companyName.trim()) completedFields++;
      if (profileData.aboutCompany && profileData.aboutCompany.trim()) completedFields++;
      if (profileData.locationPolicy && profileData.locationPolicy.trim()) completedFields++;
      if (profileData.website && profileData.website.trim()) completedFields++;
    } else {
      if (profileData.bio && profileData.bio.trim()) completedFields++;
      if (profileData.location && profileData.location.trim()) completedFields++;
      if (profileData.website && profileData.website.trim()) completedFields++;
      if (profileData.avatar) completedFields++;
      if (profileData.skills && profileData.skills.length > 0) completedFields++;
      if (profileData.experience && profileData.experience.length > 0) completedFields++;
      if (profileData.education && profileData.education.length > 0) completedFields++;
      if (profileData.walletAddress && profileData.walletAddress.trim()) completedFields++;
    }
    return Math.round((completedFields / totalFields) * 100);
  };

  // ...existing code...
  // Removed duplicate declarations of isEditingCompanyName and companyNameInput

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">Please sign in to view your profile.</p>
          <Button onClick={() => navigate("/auth?redirectTo=/profile")}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  // ...existing code...
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative group">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profileData.avatar} />
                  <AvatarFallback className="text-2xl">
                    {user.role === 'company'
                      ? ((profileData.companyName || profileData.fullName || 'C').charAt(0))
                      : (profileData.fullName?.charAt(0) || user.fullName?.charAt(0) || user.email?.charAt(0) || 'A')}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 justify-between">
                  <h1 className="text-3xl font-bold flex items-center gap-2">
                    {user.role === 'company' ? (
                      <>
                        {profileData.companyName || profileData.fullName || 'Talent Hire'}
                        {subscribed && expirationDate ? (
                          <span
                            className="flex items-center gap-1 border border-blue-600 rounded-full px-3 py-1 bg-blue-50 cursor-pointer"
                            onClick={() => navigate('/get-verified')}
                            title="Manage your subscription"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#2563eb" className="w-4 h-4">
                              <circle cx="12" cy="12" r="10" stroke="#2563eb" strokeWidth="2" fill="#fff" />
                              <path strokeLinecap="round" strokeLinejoin="round" stroke="#2563eb" strokeWidth="2" d="M9 12l2 2 4-4" />
                            </svg>
                            <span className="text-blue-600 font-medium text-xs">Verified</span>
                          </span>
                        ) : (
                          <button
                            className="flex items-center gap-1 focus:outline-none border border-blue-600 rounded-full px-3 py-1 bg-white hover:bg-blue-50 transition"
                            onClick={() => navigate('/get-verified')}
                            type="button"
                            aria-label="Get Verified"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#2563eb" className="w-4 h-4">
                              <circle cx="12" cy="12" r="10" stroke="#2563eb" strokeWidth="2" fill="#fff" />
                              <path strokeLinecap="round" strokeLinejoin="round" stroke="#2563eb" strokeWidth="2" d="M9 12l2 2 4-4" />
                            </svg>
                            <span className="text-blue-600 font-medium text-xs">Get Verified</span>
                          </button>
                        )}
                      </>
                    ) : (
                      <>{profileData.fullName}{' '}
                        {subscribed && expirationDate ? (
                          <span
                            className="flex items-center gap-1 border border-blue-600 rounded-full px-3 py-1 bg-blue-50 cursor-pointer"
                            onClick={() => navigate('/get-verified')}
                            title="Manage your subscription"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#2563eb" className="w-4 h-4">
                              <circle cx="12" cy="12" r="10" stroke="#2563eb" strokeWidth="2" fill="#fff" />
                              <path strokeLinecap="round" strokeLinejoin="round" stroke="#2563eb" strokeWidth="2" d="M9 12l2 2 4-4" />
                            </svg>
                            <span className="text-blue-600 font-medium text-xs">Verified</span>
                          </span>
                        ) : (
                          <button
                            className="flex items-center gap-1 focus:outline-none border border-blue-600 rounded-full px-3 py-1 bg-white hover:bg-blue-50 transition"
                            onClick={() => navigate('/get-verified')}
                            type="button"
                            aria-label="Get Verified"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#2563eb" className="w-4 h-4">
                              <circle cx="12" cy="12" r="10" stroke="#2563eb" strokeWidth="2" fill="#fff" />
                              <path strokeLinecap="round" strokeLinejoin="round" stroke="#2563eb" strokeWidth="2" d="M9 12l2 2 4-4" />
                            </svg>
                            <span className="text-blue-600 font-medium text-xs">Get Verified</span>
                          </button>
                        )}
                      </>
                    )}
                  </h1>
              
                    {/* Removed duplicate Download CV button for verified users who are not companies */}
                </div>
                {user.role === 'company' ? (
                  <>
                    <p className="Avalanche text-muted-foreground mb-4 max-w-2xl">
                      {profileData.aboutCompany || 'No bio added yet. Update your profile in Settings to add a bio.'}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      {user.email && (
                        <span className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {user.email}
                        </span>
                      )}
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Member Since {(() => {
                          if (profileData.createdAt) {
                            // Try to parse Firestore timestamp string
                            let date;
                            if (typeof profileData.createdAt === 'string' && profileData.createdAt.includes('at')) {
                              // Example: 'September 15, 2025 at 7:07:08 AM UTC+1'
                              // Remove 'at ...' and parse only the date part
                              const datePart = profileData.createdAt.split(' at ')[0];
                              date = new Date(datePart);
                              if (isNaN(date.getTime())) {
                                // Fallback: try parsing whole string
                                date = new Date(profileData.createdAt);
                              }
                            } else {
                              date = new Date(profileData.createdAt);
                            }
                            if (!isNaN(date.getTime())) {
                              return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
                            }
                          }
                          return '';
                        })()}
                      </span>
                      {profileData.locationPolicy && (
                        <span className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {profileData.locationPolicy}
                        </span>
                      )}
                    </div>
                    {((Array.isArray((profileData as unknown as Record<string, unknown>)['websites']) && (((profileData as unknown as Record<string, unknown>)['websites']) as string[]).length > 0) || profileData.twitter || profileData.linkedin || profileData.discord) && (
                      <div className="flex flex-wrap items-center gap-4 mt-2">
                        {/* Render websites array if present */}
                        {Array.isArray((profileData as unknown as Record<string, unknown>)['websites']) && (((profileData as unknown as Record<string, unknown>)['websites']) as string[]).map((w: string, i: number) => (
                          <a key={i} href={w.startsWith('http') ? w : `https://${w}`} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                            {getWebsiteIcon(w)}
                          </a>
                        ))}
                        {profileData.twitter && (
                          <a href={profileData.twitter} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-label="X">
                              <path d="M18.244 3H21l-6.58 7.51L22.5 21h-6.73l-4.27-5.18L6 21H3.244l6.97-7.96L1.5 3h6.86l3.86 4.7L18.244 3Zm-1.18 16h1.92L8.98 5h-1.94l10.02 14Z"/>
                            </svg>
                          </a>
                        )}
                        {profileData.linkedin && (
                          <a href={profileData.linkedin} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                            <Linkedin className="h-4 w-4" />
                          </a>
                        )}
                        {profileData.discord && (
                          <a href={profileData.discord} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-label="Discord">
                              <path d="M20.317 4.369A19.791 19.791 0 0 0 16.885 3.1a.486.486 0 0 0-.518.243c-.211.375-.444.864-.608 1.249a18.524 18.524 0 0 0-5.518 0c-.164-.385-.397-.874-.608-1.249a.486.486 0 0 0-.518-.243c-1.432.326-2.814.812-4.112 1.269A.478.478 0 0 0 2 5.77c-1.1 2.042-1.75 4.29-1.75 6.6 0 7.5 6.5 10.5 12.75 10.5s12.75-3 12.75-10.5c0-2.31-.65-4.558-1.75-6.6a.478.478 0 0 0-.433-.401ZM8.02 15.27c-1.18 0-2.15-1.08-2.15-2.41 0-1.33.96-2.41 2.15-2.41s2.15 1.08 2.15 2.41c0 1.33-.96 2.41-2.15 2.41Zm7.96 0c-1.18 0-2.15-1.08-2.15-2.41 0-1.33.96-2.41 2.15-2.41s2.15 1.08 2.15 2.41c0 1.33-.96 2.41-2.15 2.41Z"/>
                            </svg>
                          </a>
                        )}
                      </div>
                    )}
                    {/* Removed duplicate Get Verified button under company profile social links */}
                  </>
                ) : (
                  <>
                    {profileData.bio ? (
                      <p className="Avalanche text-muted-foreground mb-4 max-w-2xl">
                        {profileData.bio}
                      </p>
                    ) : (
                      <p className="Avalanche text-muted-foreground mb-4 max-w-2xl">
                        No bio added yet. Update your profile in Settings to add a bio.
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      {user.email && (
                        <span className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {user.email}
                        </span>
                      )}
                      <span className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {profileData.location ? profileData.location : 'No location set'}
                      </span>
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Member Since {(() => {
                          if (profileData.createdAt) {
                            const date = new Date(profileData.createdAt);
                            if (!isNaN(date.getTime())) {
                              return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
                            }
                          }
                          return 'Recently';
                        })()}
                      </span>
                      {/* Download CV button for verified users who are not companies */}
                      {/* Desktop: inline with info row; Mobile: below social icons */}
                      <div className="hidden md:flex w-full">
                        {subscribed && expirationDate && (
                          <Button
                            variant="outline"
                            className="flex items-center gap-2 ml-auto bg-transparent text-white border border-white hover:bg-white/10"
                            type="button"
                            onClick={handleDownloadCV}
                          >
                            <Download className="h-4 w-4 text-white" />
                            <span className="text-white">Download CV</span>
                          </Button>
                        )}
                      </div>
                    </div>
                    {/* Social icons row (already present) */}
                    {((Array.isArray((profileData as unknown as Record<string, unknown>)['websites']) && (((profileData as unknown as Record<string, unknown>)['websites']) as string[]).length > 0) || profileData.website || profileData.twitter || profileData.linkedin || profileData.discord) && (
                      <div className="flex flex-wrap items-center gap-4 mt-2 md:mt-1">
                        {/* ...existing social icon rendering code... */}
                      </div>
                    )}
                  
                    {((Array.isArray((profileData as unknown as Record<string, unknown>)['websites']) && (((profileData as unknown as Record<string, unknown>)['websites']) as string[]).length > 0) || profileData.website || profileData.twitter || profileData.linkedin || profileData.discord) && (
                      <div className="flex flex-wrap items-center gap-4 mt-2">
                        {/* Render websites array if present */}
                        {Array.isArray((profileData as unknown as Record<string, unknown>)['websites']) && (((profileData as unknown as Record<string, unknown>)['websites']) as string[]).map((w: string, i: number) => (
                          <a key={i} href={w.startsWith('http') ? w : `https://${w}`} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                            {getWebsiteIcon(w)}
                          </a>
                        ))}
                        {/* Fallback to single website if no websites array */}
                        {(!Array.isArray((profileData as unknown as Record<string, unknown>)['websites']) || (((profileData as unknown as Record<string, unknown>)['websites']) as string[]).length === 0) && profileData.website && (
                          <a 
                            href={profileData.website.startsWith('http') ? profileData.website : `https://${profileData.website}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="hover:text-primary transition-colors"
                          >
                            {getWebsiteIcon(profileData.website)}
                          </a>
                        )}
                        {profileData.twitter && (
                          <a href={profileData.twitter} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-label="X">
                              <path d="M18.244 3H21l-6.58 7.51L22.5 21h-6.73l-4.27-5.18L6 21H3.244l6.97-7.96L1.5 3h6.86l3.86 4.7L18.244 3Zm-1.18 16h1.92L8.98 5h-1.94l10.02 14Z"/>
                            </svg>
                          </a>
                        )}
                        {profileData.linkedin && (
                          <a href={profileData.linkedin} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                            <Linkedin className="h-4 w-4" />
                          </a>
                        )}
                        {profileData.discord && (
                          <a href={profileData.discord} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-label="Discord">
                              <path d="M20.317 4.369A19.791 19.791 0 0 0 16.885 3.1a.486.486 0 0 0-.518.243c-.211.375-.444.864-.608 1.249a18.524 18.524 0 0 0-5.518 0c-.164-.385-.397-.874-.608-1.249a.486.486 0 0 0-.518-.243c-1.432.326-2.814.812-4.112 1.269A.478.478 0 0 0 2 5.77c-1.1 2.042-1.75 4.29-1.75 6.6 0 7.5 6.5 10.5 12.75 10.5s12.75-3 12.75-10.5c0-2.31-.65-4.558-1.75-6.6a.478.478 0 0 0-.433-.401ZM8.02 15.27c-1.18 0-2.15-1.08-2.15-2.41 0-1.33.96-2.41 2.15-2.41s2.15 1.08 2.15 2.41c0 1.33-.96 2.41-2.15 2.41Zm7.96 0c-1.18 0-2.15-1.08-2.15-2.41 0-1.33.96-2.41 2.15-2.41s2.15 1.08 2.15 2.41c0 1.33-.96 2.41-2.15 2.41Z"/>
                            </svg>
                          </a>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
                {/* Mobile: Download CV button below social icons */}
                    <div className="flex md:hidden w-full mt-4">
                      {subscribed && expirationDate && (
                        <Button
                          variant="outline"
                          className="w-full flex items-center justify-center gap-2 bg-transparent text-white border border-white hover:bg-white/10"
                          type="button"
                          onClick={handleDownloadCV}
                        >
                          <Download className="h-4 w-4 text-white" />
                          <span className="text-white">Download CV</span>
                        </Button>
                      )}
          </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {user.role === 'company' && (
              <>
                {/* Company Profile Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      Company Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Company Name</p>
                        <p className="font-medium">{profileData.companyName || profileData.fullName || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Industry & Focus</p>
                        <p className="font-medium">{profileData.industry || 'Not set'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-muted-foreground">About Us</p>
                        <p className="font-medium">{profileData.aboutCompany || 'No company bio yet'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Website</p>
                        <p className="font-medium">{profileData.website || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">X (Twitter)</p>
                        <p className="font-medium">{profileData.twitter || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">LinkedIn</p>
                        <p className="font-medium">{profileData.linkedin || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Discord</p>
                        <p className="font-medium">{profileData.discord || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Location</p>
                        <p className="font-medium">{profileData.locationPolicy || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Company Size</p>
                        <p className="font-medium">{profileData.companySize || 'Not set'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-muted-foreground">Vision & Culture</p>
                        <p className="font-medium">{profileData.visionCulture || 'Not set'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-muted-foreground">Contact</p>
                        <p className="font-medium">{profileData.contactEmail || user.email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {user.role !== 'company' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Skills & Technologies
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {profileData.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profileData.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-sm">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No skills added yet. Update your profile in Settings to add your skills.</p>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {user.role !== 'company' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Professional Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {profileData.experience.length > 0 ? (
                    profileData.experience.map((exp, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{exp.title}</h3>
                            <p className="text-muted-foreground">{exp.company}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {exp.period}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{exp.description}</p>
                        {index < profileData.experience.length - 1 && <Separator />}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">No experience added yet. Update your profile in Settings to add your work experience.</p>
                  )}
                </CardContent>
              </Card>
            )}

            {user.role !== 'company' && (
              <>
                {/* Education card after Professional Experience */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Education
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {profileData.education.length > 0 ? (
                      profileData.education.map((edu, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{edu.degree}</h3>
                              <p className="text-muted-foreground">{edu.school}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {edu.period}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{edu.description}</p>
                          {index < profileData.education.length - 1 && <Separator />}
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">No education added yet. Update your profile in Settings to add your educational background.</p>
                    )}
                  </CardContent>
                </Card>
                {/* Certifications card directly under Education - visible only to verified profiles */}
                {subscribed && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Certifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {profileData.certifications && profileData.certifications.length > 0 ? (
                        profileData.certifications.map((c, i) => (
                          <div key={i} className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                  <Award className="h-5 w-5 text-yellow-600" />
                                </div>
                                <div>
                                  <div className="font-semibold">{c.title}</div>
                                  <div className="text-sm text-muted-foreground">{c.issuer} • {c.date ? new Date(c.date).toLocaleString('en-US', { month: 'short', year: 'numeric' }) : ''}</div>
                                  {c.description && <div className="text-sm mt-1">{c.description}</div>}
                                  {c.credentialUrl && (
                                    <a className="text-sm text-primary underline inline-flex items-center gap-1" href={c.credentialUrl} target="_blank" rel="noreferrer">
                                      View credential
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                            {i < (profileData.certifications.length - 1) && <Separator />}
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-sm">No certifications added yet. Update your profile in Settings to add your certifications.</p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}

                     
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {user.role === 'company' ? (
                  <>
                    <Button asChild className="w-full">
                      <a href="/manage-jobs">Manage Jobs</a>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate('/view-applicants')}
                    >
                      View Applicants
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <a href="/billing">Billing & Verification</a>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <a href="/settings">Settings</a>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <a href="/analytics">Analytics</a>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="outline" className="w-full">
                      <a href="/saved-jobs">Saved Jobs</a>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <a href="/settings">Settings</a>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <a href="/billing">Billing & Verification</a>
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Account Status (Job Seeker only) */}
            {user.role !== 'company' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Account Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Account Type</span>
                    <Badge variant={user.role === 'company' as unknown ? 'default' : 'secondary'}>
                      {user.role === 'company' as unknown ? 'Company' : 'Job Seeker'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Profile Complete</span>
                    <Badge variant="default">{calculateProfileCompletion()}%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Applications</span>
                    <span className="text-sm font-medium">{applicationsCount}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Company sidebar: Connect Wallet, Account Status, Subscription Status */}
            {user.role === 'company' && (
              <>
                {/* Connect Wallet */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Connect Wallet</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {profileData.walletAddress ? (
                      <>
                        <Button
                          className="w-full flex items-center justify-center gap-2"
                          variant="destructive"
                          onClick={async () => {
                            setProfileData(prev => ({ ...prev, walletAddress: '' }));
                            setWalletJustConnected(false);
                            toast.success('Wallet disconnected!');
                            if (user && user.id) {
                              const userRef = doc(db, 'users', user.id);
                              await import('firebase/firestore').then(firestore =>
                                firestore.updateDoc(userRef, { walletAddress: '' })
                              );
                            }
                          }}
                        >
                          <LogOut className="h-4 w-4" />
                          Disconnect
                        </Button>
                        <div className="mt-2 text-xs text-green-600 break-all text-center">
                          Connected: {getShortAddress(profileData.walletAddress)}
                        </div>
                      </>
                    ) : (
                      <>
                        <Button
                          className="w-full flex items-center justify-center gap-2"
                          variant="default"
                          onClick={() => setWalletModalOpen(true)}
                        >
                          <Wallet className="h-4 w-4" />
                          Connect Wallet
                        </Button>
                        <WalletSelectModal
                          open={walletModalOpen}
                          onSelect={async (wallet) => {
                            setWalletModalOpen(false);
                            setWalletError(null);
                            let provider = null;
                            if (wallet === "metamask" && window.ethereum && window.ethereum.isMetaMask) {
                              provider = window.ethereum;
                            } else if (wallet === "core" && window.base) {
                              provider = window.base;
                            } else if (
                              wallet === "core" &&
                              window.ethereum &&
                              window.ethereum.isMetaMask === false &&
                              'isCoinbaseWallet' in window.ethereum && window.ethereum.isCoinbaseWallet === false
                            ) {
                              provider = window.ethereum;
                            } else {
                              setWalletError("Selected wallet not found. Please install it and try again.");
                              toast.error("Selected wallet not found. Please install it and try again.");
                              return;
                            }
                            try {
                              // Only request accounts when user clicks, not on mount
                              const accounts = await provider.request({ method: "eth_requestAccounts" });
                              const address = accounts[0];
                              if (!address) throw new Error("No account found");
                              setProfileData(prev => ({ ...prev, walletAddress: address }));
                              setWalletJustConnected(true);
                              if (user && user.id) {
                                const userRef = doc(db, "users", user.id);
                                await import("firebase/firestore").then(firestore =>
                                  firestore.updateDoc(userRef, { walletAddress: address })
                                );
                              }
                              toast.success("Wallet connected!");
                            } catch (err) {
                              setWalletError("Failed to connect wallet. Please try again.");
                              toast.error("Failed to connect wallet.");
                            }
                          }}
                          onClose={() => setWalletModalOpen(false)}
                        />
                        {walletError && (
                          <div className="mt-2 text-xs text-red-600 text-center">{walletError}</div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
                {/* Account Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Account Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Account Type</span>
                      <Badge variant="default">Company</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Profile Complete</span>
                      <Badge variant="default">{calculateProfileCompletion()}%</Badge>
                    </div>
                    {/* Applications count removed for company profile */}
                  </CardContent>
                </Card>
                {/* Subscription Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Subscription Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status</span>
                      {subscribed ? (
                        <Badge variant="default" className="flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#2563eb" className="w-4 h-4">
                            <circle cx="12" cy="12" r="10" stroke="#2563eb" strokeWidth="2" fill="#fff" />
                            <path strokeLinecap="round" strokeLinejoin="round" stroke="#2563eb" strokeWidth="2" d="M9 12l2 2 4-4" />
                          </svg>
                          <span>Verified</span>
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Not Verified</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Expires</span>
                      <span className="text-sm font-medium">{expirationDate || 'N/A'}</span>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Account Status */}
        

              {/* Connect Wallet (Job Seeker only) */}
              {user.role !== 'company' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Connect Wallet</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {profileData.walletAddress ? (
                      <>
                        <Button
                          className="w-full flex items-center justify-center gap-2"
                          variant="destructive"
                          onClick={async () => {
                            setProfileData(prev => ({ ...prev, walletAddress: '' }));
                            setWalletJustConnected(false);
                            toast.success('Wallet disconnected!');
                            if (user && user.id) {
                              const userRef = doc(db, 'users', user.id);
                              await import('firebase/firestore').then(firestore =>
                                firestore.updateDoc(userRef, { walletAddress: '' })
                              );
                            }
                          }}
                        >
                          <LogOut className="h-4 w-4" />
                          Disconnect
                        </Button>
                        <div className="mt-2 text-xs text-green-600 break-all text-center">
                          Connected: {getShortAddress(profileData.walletAddress)}
                        </div>
                      </>
                    ) : (
                      <Button
                        className="w-full flex items-center justify-center gap-2"
                        variant="default"
                        onClick={async () => {
                          if (!window.ethereum) {
                            toast.error('MetaMask is not installed.');
                            return;
                          }
                          try {
                            // Only request accounts when user clicks, not on mount
                            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                            const address = accounts[0];
                            if (!address) throw new Error('No account found');
                            setProfileData(prev => ({ ...prev, walletAddress: address }));
                            setWalletJustConnected(true);
                            if (user && user.id) {
                              const userRef = doc(db, 'users', user.id);
                              await import('firebase/firestore').then(firestore =>
                                firestore.updateDoc(userRef, { walletAddress: address })
                              );
                            }
                            toast.success('Wallet connected!');
                          } catch (err) {
                            toast.error('Failed to connect wallet.');
                          }
                        }}
                      >
                        <Wallet className="h-4 w-4" />
                        Connect Wallet
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

            {user.role !== 'company' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Subscription Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status</span>
                      {subscribed ? (
                        <Badge variant="default" className="flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#2563eb" className="w-4 h-4">
                            <circle cx="12" cy="12" r="10" stroke="#2563eb" strokeWidth="2" fill="#fff" />
                            <path strokeLinecap="round" strokeLinejoin="round" stroke="#2563eb" strokeWidth="2" d="M9 12l2 2 4-4" />
                          </svg>
                          <span>Verified</span>
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Not Verified</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Expires</span>
                      <span className="text-sm font-medium">{expirationDate || 'N/A'}</span>
                    </div>
                      {/* Removed Connect Wallet button as requested */}
                    {/* subLoading && <div className="text-xs text-blue-600">Processing...</div>*/}
                    {/*subError && <div className="text-xs text-red-600">{subError}</div>*/}
                  </CardContent>
                </Card>
            )}


          </div>
        </div>
      </div>
    </div>
  );
}
export default Profile;