import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { db, storage, auth } from '@/integrations/firebase/client';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Briefcase, 
  MapPin, 
  Globe, 
  Wallet, 
  Shield, 
  Settings as SettingsIcon,
  Save,
  Edit,
  X,
  Check,
  Plus,
  BookOpen,
  Code,
  Award,
  Upload
} from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";

// Add TypeScript declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (params: unknown) => void) => void;
      removeListener: (event: string, callback: (params: unknown) => void) => void;
    };
  }
}

const Settings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
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
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || "",
    bio: "",
    location: "",
    website: "",
    skills: [] as string[],
    experience: [] as Experience[],
    education: [] as Education[],
    avatar: "",
    walletAddress: "",
    // Company fields
    companyName: "",
    companyLogo: "",
    industry: "",
    aboutCompany: "",
    twitter: "",
    linkedin: "",
    discord: "",
    locationPolicy: "",
    companySize: "",
    visionCulture: "",
    contactEmail: "",
  });
  const [newSkill, setNewSkill] = useState("");
  const [newExperience, setNewExperience] = useState<Experience>({
    title: "",
    company: "",
    period: "",
    description: ""
  });
  const [newEducation, setNewEducation] = useState<Education>({
    degree: "",
    school: "",
    period: "",
    description: ""
  });

  const loadProfileData = React.useCallback(async () => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.id as string);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setProfileData({
          fullName: data.fullName || user.fullName || "",
          bio: data.bio || "",
          location: data.location || "",
          website: data.website || "",
          skills: data.skills || [],
          experience: data.experience || [],
          education: data.education || [],
          avatar: data.avatar || "",
          walletAddress: data.walletAddress || "",
          companyName: data.companyName || "",
          companyLogo: data.companyLogo || "",
          industry: data.industry || "",
          aboutCompany: data.aboutCompany || "",
          twitter: data.twitter || "",
          linkedin: data.linkedin || "",
          discord: data.discord || "",
          locationPolicy: data.locationPolicy || "",
          companySize: data.companySize || "",
          visionCulture: data.visionCulture || "",
          contactEmail: data.contactEmail || data.email || user.email || "",
        });
      }
    } catch (error: unknown) {
      console.error('Error loading profile data:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user, loadProfileData]);

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.id as string);
      const updateData: {
        fullName: string;
        bio: string;
        location: string;
        website: string;
        skills: string[];
        experience: Experience[];
        education: Education[];
        companyName: string;
        companyLogo: string;
        industry: string;
        aboutCompany: string;
        twitter: string;
        linkedin: string;
        discord: string;
        locationPolicy: string;
        companySize: string;
        visionCulture: string;
        contactEmail: string;
        updated_at: string;
        avatar?: string;
      } = {
        fullName: profileData.fullName,
        bio: profileData.bio,
        location: profileData.location,
        website: profileData.website,
        skills: profileData.skills,
        experience: profileData.experience,
        education: profileData.education,
        companyName: profileData.companyName,
        companyLogo: profileData.companyLogo,
        industry: profileData.industry,
        aboutCompany: profileData.aboutCompany,
        twitter: profileData.twitter,
        linkedin: profileData.linkedin,
        discord: profileData.discord,
        locationPolicy: profileData.locationPolicy,
        companySize: profileData.companySize,
        visionCulture: profileData.visionCulture,
        contactEmail: profileData.contactEmail || user.email,
        updated_at: new Date().toISOString(),
      };

      // Include avatar if it exists (both URL and base64 are allowed)
      if (profileData.avatar) {
        updateData.avatar = profileData.avatar;
      }
      await updateDoc(userRef, updateData);
      setEditing(false);
      toast.success("Profile updated successfully");
    } catch (error: unknown) {
      console.error('Error updating profile:', error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addExperience = () => {
    if (newExperience.title && newExperience.company) {
      setProfileData(prev => ({
        ...prev,
        experience: [...prev.experience, { ...newExperience }]
      }));
      setNewExperience({ title: "", company: "", period: "", description: "" });
    }
  };

  const removeExperience = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const addEducation = () => {
    if (newEducation.degree && newEducation.school) {
      setProfileData(prev => ({
        ...prev,
        education: [...prev.education, { ...newEducation }]
      }));
      setNewEducation({ degree: "", school: "", period: "", description: "" });
    }
  };

  const removeEducation = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      // Validate file size (max 2MB for base64 storage)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }

      // Compress image
      const compressedFile = await compressImage(file);
      
      // Try Firebase Storage first, fallback to base64
      try {
        // Upload to Firebase Storage
        const avatarRef = ref(storage, `avatars/${user.id}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(avatarRef, compressedFile);
        const downloadURL = await getDownloadURL(snapshot.ref);

        // Delete old avatar if exists
        if (profileData.avatar && profileData.avatar.includes('firebase')) {
          try {
            const oldAvatarRef = ref(storage, profileData.avatar);
            await deleteObject(oldAvatarRef);
          } catch (error: unknown) {
            console.log('Old avatar not found or already deleted');
          }
        }

        setProfileData(prev => ({
          ...prev,
          avatar: downloadURL
        }));

        toast.success('Avatar uploaded successfully to cloud storage');
      } catch (storageError: unknown) {
        console.log('Firebase Storage failed, using base64 fallback:', storageError);
        
        // Fallback to base64 storage
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64Data = e.target?.result as string;
          
          // Check if base64 data is within Firestore limits (1MB)
          const base64Size = Math.ceil((base64Data.length * 3) / 4);
          if (base64Size > 900000) { // Leave some buffer for other data
            toast.error('Image is too large. Please select a smaller image.');
            return;
          }
          
          setProfileData(prev => ({
            ...prev,
            avatar: base64Data
          }));
          
          toast.success('Avatar uploaded successfully (stored locally)');
        };
        reader.readAsDataURL(compressedFile);
      }
    } catch (error: unknown) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar. Please try again.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions (max 200x200 for better compression)
        const maxSize = 200;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, 'image/jpeg', 0.6); // 60% quality for smaller file size
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const connectWallet = async () => {
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        toast.error('MetaMask is not installed. Please install MetaMask to connect your wallet.');
        return;
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      
      if (account) {
        // Update user document with wallet address
        if (user) {
          const userRef = doc(db, 'users', user.id as string);
          await updateDoc(userRef, {
            walletAddress: account,
            updated_at: new Date().toISOString(),
          });
          
          toast.success(`Wallet connected: ${account.slice(0, 6)}...${account.slice(-4)}`);
          
          // Reload profile data to reflect changes
          loadProfileData();
        }
      }
    } catch (error: unknown) {
      console.error('Error connecting wallet:', error);
      if (typeof error === 'object' && error !== null && 'code' in error && (error as { code?: unknown }).code === 4001) {
        toast.error('User rejected the connection request');
      } else {
        toast.error('Failed to connect wallet. Please try again.');
      }
    }
  };

  const passwordStrengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

  const handlePasswordChange = async () => {
    if (!user || !user.email) {
      toast.error('User information not available');
      return;
    }

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (!passwordStrengthRegex.test(passwordData.newPassword)) {
      toast.error('Password must be at least 8 characters, include uppercase, lowercase, number, and special character.');
      return;
    }

    setChangingPassword(true);
    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, passwordData.currentPassword);
      await reauthenticateWithCredential(auth.currentUser!, credential);

      // Update password
      await updatePassword(auth.currentUser!, passwordData.newPassword);

      toast.success('Password updated successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordForm(false);
      setChangingPassword(false);
    } catch (error: unknown) {
      console.error('Error changing password:', error);
      let errorMessage = 'Current password is incorrect.';
      if (typeof error === 'object' && error !== null) {
        const code = (error as { code?: string }).code;
        const message = (error as { message?: string }).message || '';
        if (code === 'auth/wrong-password' || message.toLowerCase().includes('wrong-password')) {
          errorMessage = 'Current password is incorrect';
        } else if (code === 'auth/weak-password') {
          errorMessage = 'New password is too weak';
        }
      }
      toast.error(errorMessage);
    } finally {
      setChangingPassword(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <SettingsIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sign in to access settings</h3>
            <p className="text-muted-foreground">Please sign in to manage your account settings</p>
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
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Profile Information (Users only) */}
          {user.role !== 'company' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Manage your profile details and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Profile Settings</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditing(!editing)}
                  className="h-8 px-2"
                >
                  {editing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                </Button>
              </div>

              <div className="space-y-4">
                {/* Avatar Upload */}
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={profileData.avatar} />
                    <AvatarFallback className="text-lg">
                      {profileData.fullName?.charAt(0) || user.fullName?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {editing && (
                    <div>
                      <Label htmlFor="avatar" className="cursor-pointer">
                        <Button variant="outline" size="sm" asChild disabled={uploadingAvatar}>
                          <span>
                            {uploadingAvatar ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Avatar
                              </>
                            )}
                          </span>
                        </Button>
                      </Label>
                      <input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        disabled={uploadingAvatar}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  {editing ? (
                    <Input
                      id="fullName"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground py-2">{profileData.fullName || "Not set"}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="bio">Bio (100 characters max)</Label>
                  {editing ? (
                    <div className="relative">
                      <Textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell us about yourself"
                        maxLength={100}
                        className="pr-16"
                      />
                      <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                        {100 - profileData.bio.length} remaining
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground py-2">{profileData.bio || "No bio yet"}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  {editing ? (
                    <Input
                      id="location"
                      value={profileData.location}
                      onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Enter your location"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground py-2">{profileData.location || "Not set"}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  {editing ? (
                    <Input
                      id="website"
                      value={profileData.website}
                      onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="Enter your website URL"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground py-2">{profileData.website || "Not set"}</p>
                  )}
                </div>
              </div>

              {editing && (
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSave} disabled={loading} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button variant="outline" onClick={() => setEditing(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          )}

          {/* Skills & Technologies (Users only) */}
          {user.role !== 'company' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Skills & Technologies
              </CardTitle>
              <CardDescription>
                Add your technical skills and expertise
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {editing && (
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill"
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  />
                  <Button onClick={addSkill} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2">
                {profileData.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    {editing && (
                      <button
                        onClick={() => removeSkill(skill)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
          )}

          {/* Professional Experience (Users only) */}
          {user.role !== 'company' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Professional Experience
              </CardTitle>
              <CardDescription>
                Add your work experience and achievements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {editing && (
                <div className="space-y-3 p-4 border rounded-lg">
                  <Input
                    value={newExperience.title}
                    onChange={(e) => setNewExperience(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Job Title"
                  />
                  <Input
                    value={newExperience.company}
                    onChange={(e) => setNewExperience(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Company"
                  />
                  <Input
                    value={newExperience.period}
                    onChange={(e) => setNewExperience(prev => ({ ...prev, period: e.target.value }))}
                    placeholder="Period (e.g., 2022 - Present)"
                  />
                  <Textarea
                    value={newExperience.description}
                    onChange={(e) => setNewExperience(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description"
                  />
                  <Button onClick={addExperience} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Experience
                  </Button>
                </div>
              )}
              
              <div className="space-y-4">
                {profileData.experience.map((exp, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{exp.title}</h4>
                        <p className="text-sm text-muted-foreground">{exp.company}</p>
                        <p className="text-xs text-muted-foreground">{exp.period}</p>
                        <p className="text-sm mt-2">{exp.description}</p>
                      </div>
                      {editing && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExperience(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          )}

          {/* Education (Users only) */}
          {user.role !== 'company' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Education
              </CardTitle>
              <CardDescription>
                Add your educational background
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {editing && (
                <div className="space-y-3 p-4 border rounded-lg">
                  <Input
                    value={newEducation.degree}
                    onChange={(e) => setNewEducation(prev => ({ ...prev, degree: e.target.value }))}
                    placeholder="Degree"
                  />
                  <Input
                    value={newEducation.school}
                    onChange={(e) => setNewEducation(prev => ({ ...prev, school: e.target.value }))}
                    placeholder="School/University"
                  />
                  <Input
                    value={newEducation.period}
                    onChange={(e) => setNewEducation(prev => ({ ...prev, period: e.target.value }))}
                    placeholder="Period (e.g., 2016 - 2020)"
                  />
                  <Textarea
                    value={newEducation.description}
                    onChange={(e) => setNewEducation(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description"
                  />
                  <Button onClick={addEducation} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Education
                  </Button>
                </div>
              )}
              
              <div className="space-y-4">
                {profileData.education.map((edu, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold">{edu.degree}</h4>
                        <p className="text-sm text-muted-foreground">{edu.school}</p>
                        <p className="text-xs text-muted-foreground">{edu.period}</p>
                        <p className="text-sm mt-2">{edu.description}</p>
                      </div>
                      {editing && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEducation(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          )}

          {/* Company Profile (Companies only) */}
          {user.role === 'company' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Company Profile
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditing(!editing)}
                  className="h-8 px-2"
                  aria-label={editing ? 'Cancel Edit' : 'Edit Company Profile'}
                >
                  {editing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                </Button>
              </div>
              <CardDescription>
                Manage your company information and branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Avatar Upload for Company */}
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={profileData.avatar} />
                  <AvatarFallback className="text-lg">
                    {profileData.companyName?.charAt(0) || 'C'}
                  </AvatarFallback>
                </Avatar>
                {editing && (
                  <div>
                    <Label htmlFor="company-avatar" className="cursor-pointer">
                      <Button variant="outline" size="sm" asChild disabled={uploadingAvatar}>
                        <span>
                          {uploadingAvatar ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Avatar
                            </>
                          )}
                        </span>
                      </Button>
                    </Label>
                    <input
                      id="company-avatar"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={uploadingAvatar}
                    />
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                {editing ? (
                  <Input
                    id="companyName"
                    value={profileData.companyName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Enter your company name"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground py-2">{profileData.companyName || "Not set"}</p>
                )}
              </div>

              <div>
                <Label htmlFor="industry">Industry & Focus</Label>
                {editing ? (
                  <Input
                    id="industry"
                    value={profileData.industry}
                    onChange={(e) => setProfileData(prev => ({ ...prev, industry: e.target.value }))}
                    placeholder="e.g., Blockchain, DeFi, NFT"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground py-2">{profileData.industry || "Not set"}</p>
                )}
              </div>

              <div>
                <Label htmlFor="aboutCompany">About Us (Short Bio)</Label>
                {editing ? (
                  <Textarea
                    id="aboutCompany"
                    value={profileData.aboutCompany}
                    onChange={(e) => setProfileData(prev => ({ ...prev, aboutCompany: e.target.value }))}
                    placeholder="2-3 sentences describing your mission"
                    maxLength={300}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground py-2">{profileData.aboutCompany || "No company bio yet"}</p>
                )}
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                {editing ? (
                  <Input
                    id="website"
                    value={profileData.website}
                    onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://yourcompany.com"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground py-2">{profileData.website || "Not set"}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="twitter">X (Twitter)</Label>
                  {editing ? (
                    <Input
                      id="twitter"
                      value={profileData.twitter}
                      onChange={(e) => setProfileData(prev => ({ ...prev, twitter: e.target.value }))}
                      placeholder="https://x.com/yourcompany"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground py-2">{profileData.twitter || "Not set"}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  {editing ? (
                    <Input
                      id="linkedin"
                      value={profileData.linkedin}
                      onChange={(e) => setProfileData(prev => ({ ...prev, linkedin: e.target.value }))}
                      placeholder="https://linkedin.com/company/yourcompany"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground py-2">{profileData.linkedin || "Not set"}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="discord">Discord</Label>
                  {editing ? (
                    <Input
                      id="discord"
                      value={profileData.discord}
                      onChange={(e) => setProfileData(prev => ({ ...prev, discord: e.target.value }))}
                      placeholder="https://discord.gg/yourserver"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground py-2">{profileData.discord || "Not set"}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="locationPolicy">Location</Label>
                  {editing ? (
                    <Input
                      id="locationPolicy"
                      value={profileData.locationPolicy}
                      onChange={(e) => setProfileData(prev => ({ ...prev, locationPolicy: e.target.value }))}
                      placeholder="Enter your company location"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground py-2">{profileData.locationPolicy || "Not set"}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="companySize">Company Size</Label>
                  {editing ? (
                    <Input
                      id="companySize"
                      value={profileData.companySize}
                      onChange={(e) => setProfileData(prev => ({ ...prev, companySize: e.target.value }))}
                      placeholder="e.g., 1-10, 11-50, 51-200"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground py-2">{profileData.companySize || "Not set"}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="visionCulture">Vision & Culture</Label>
                {editing ? (
                  <Textarea
                    id="visionCulture"
                    value={profileData.visionCulture}
                    onChange={(e) => setProfileData(prev => ({ ...prev, visionCulture: e.target.value }))}
                    placeholder="Why work with you? Highlight your values."
                    maxLength={400}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground py-2">{profileData.visionCulture || "Not set"}</p>
                )}
              </div>

              <div>
                <Label htmlFor="contactEmail">Contact Email</Label>
                {editing ? (
                  <Input
                    id="contactEmail"
                    type="email"
                    value={profileData.contactEmail}
                    onChange={(e) => setProfileData(prev => ({ ...prev, contactEmail: e.target.value }))}
                    placeholder="contact@company.com"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground py-2">{profileData.contactEmail || user.email}</p>
                )}
              </div>

              {editing && (
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSave} disabled={loading} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button variant="outline" onClick={() => setEditing(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          )}

                      {/* Wallet Connection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Connect Your Wallet
                </CardTitle>
                <CardDescription>
                  Connect your wallet to apply for Web3 jobs and receive payments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary/20 to-primary-glow/20 rounded-lg flex items-center justify-center">
                      <Wallet className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">MetaMask</p>
                      <p className="text-sm text-muted-foreground">
                        {profileData.walletAddress ? 
                          `Connected: ${profileData.walletAddress.slice(0, 6)}...${profileData.walletAddress.slice(-4)}` : 
                          'Connect your Web3 wallet'
                        }
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={connectWallet} 
                    variant={profileData.walletAddress ? "default" : "outline"}
                  >
                    {profileData.walletAddress ? 'Connected' : 'Connect MetaMask'}
                  </Button>
                </div>
              </CardContent>
            </Card>

          {/* Company Dashboard - Only show for company users */}
          {user.role === 'company' && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Company Dashboard
                </CardTitle>
                <CardDescription>
                  Manage your job postings and company profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button asChild className="h-11">
                    <a href="/post-job">
                      <Briefcase className="mr-2 h-4 w-4" />
                      Post a New Job
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="h-11">
                    <a href="/jobs">
                      <User className="mr-2 h-4 w-4" />
                      View All Jobs
                    </a>
                  </Button>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  <p>• Post unlimited job listings</p>
                  <p>• Access to premium candidate pool</p>
                  <p>• Verified company badge</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Account Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account Security
              </CardTitle>
              <CardDescription>
                Manage your account security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Badge variant="secondary">Coming Soon</Badge>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Password</p>
                    <p className="text-sm text-muted-foreground">Change your account password</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                  >
                    {showPasswordForm ? 'Cancel' : 'Change Password'}
                  </Button>
                </div>
                
                {showPasswordForm && (
                  <div className="space-y-3 p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Enter your current password"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Enter your new password"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirm your new password"
                      />
                    </div>
                    <Button 
                      onClick={handlePasswordChange} 
                      disabled={changingPassword}
                      className="w-full"
                    >
                      {changingPassword ? 'Updating...' : 'Update Password'}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

                      {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Status
                </CardTitle>
                <CardDescription>
                  Your current account information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Account Type</span>
                  <Badge variant={user.role === 'company' ? 'default' : 'secondary'}>
                    {user.role === 'company' ? 'Company' : 'Job Seeker'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Email</span>
                  <span className="text-sm text-muted-foreground">{user.email}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Member Since</span>
                  <span className="text-sm text-muted-foreground">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 'N/A'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Wallet Address</span>
                  <span className="text-sm text-muted-foreground">
                    {profileData.walletAddress ? 
                      `${profileData.walletAddress.slice(0, 6)}...${profileData.walletAddress.slice(-4)}` : 
                      'Not connected'
                    }
                  </span>
                </div>
              </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
};

export default Settings;
