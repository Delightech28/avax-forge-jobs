import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Wallet, User, Mail, Calendar, Edit2, MapPin, ExternalLink, CheckCircle, Briefcase } from 'lucide-react';

import { db } from '@/integrations/firebase/client';
import { toast } from 'sonner';
import Header from '@/components/Header';

const Profile = () => {
  const { user, updateProfile, signInWithWallet, loading } = useAuth();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    location: '',
    websiteUrl: '',
    avatarUrl: '',
  });
  const [websiteError, setWebsiteError] = useState('');

  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        bio: (user as any).bio || '',
        location: (user as any).location || '',
        websiteUrl: (user as any).websiteUrl || '',
        avatarUrl: (user as any).avatarUrl || '',
      });
      setWebsiteError(''); // Clear any previous validation errors
    }
  }, [user]);

  const handleSave = async () => {
    if (websiteError) {
      toast.error('Please fix the website URL before saving');
      return;
    }
    const { error } = await updateProfile(formData);
    if (!error) {
      setIsEditing(false);
    }
  };

  const validateWebsiteUrl = (url: string) => {
    if (!url) return true; // Empty URL is valid
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleWebsiteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, websiteUrl: value }));
    
    if (value && !validateWebsiteUrl(value)) {
      setWebsiteError('Please enter a valid URL (e.g., https://example.com)');
    } else {
      setWebsiteError('');
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    // Validate file size (max 2MB for base64)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    try {
      if (!user) return;
      
      // Show loading state
      toast.loading('Processing avatar...');
      
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64String = event.target?.result as string;
          
          // Update form data with base64 image
          setFormData(prev => ({ ...prev, avatarUrl: base64String }));
          
          toast.dismiss();
          toast.success('Avatar updated successfully!');
        } catch (err: any) {
          console.error('Avatar processing error:', err);
          toast.dismiss();
          toast.error('Failed to process avatar. Please try again.');
        }
      };
      
      reader.onerror = () => {
        toast.dismiss();
        toast.error('Failed to read image file. Please try again.');
      };
      
      reader.readAsDataURL(file);
      
    } catch (err: any) {
      console.error('Avatar upload error:', err);
      toast.dismiss();
      toast.error(`Upload failed: ${err.message || 'Unknown error'}`);
    }
  };



  const handleWalletConnect = async () => {
    try {
      setIsConnecting(true);
      if (!(window as any).ethereum) {
        toast.error('MetaMask not found. Please install MetaMask extension.');
        return;
      }
      
      const provider = (window as any).ethereum;
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      
      if (address) {
        const result = await signInWithWallet(address);
        if (result.error) {
          toast.error(result.error.message || 'Failed to connect wallet');
        } else {
          toast.success('Wallet connected successfully!');
        }
      }
    } catch (error: any) {
      if (error.code === 4001) {
        toast.error('Wallet connection was rejected');
      } else {
        toast.error('Failed to connect wallet. Please try again.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

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

  // Check if user signed up with wallet (no email) or email
  const needsNameSetup = !user.fullName;
  const needsWalletConnection = !user.walletAddress;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={formData.avatarUrl || ''} />
                  <AvatarFallback className="text-2xl">
                    {user.fullName?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl flex items-center gap-2">
                  {user.fullName || user.email?.split('@')[0] || 'Anonymous User'}
                  {user.role === 'company' && (
                    <Badge variant="default" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified Company
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription />
              </CardHeader>
              
              <CardContent className="space-y-4">
                {formData.bio && (
                  <p className="text-sm text-muted-foreground">{formData.bio}</p>
                )}
                
                <div className="space-y-2 text-sm">
                  {user.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{user.email}</span>
                    </div>
                  )}
                  
                                     {formData.location && (
                     <div className="flex items-center gap-2">
                       <MapPin className="h-4 w-4" />
                       <span>{formData.location}</span>
                     </div>
                   )}
                   
                   {formData.websiteUrl && (
                     <div className="flex items-center gap-2">
                       <ExternalLink className="h-4 w-4" />
                       <a 
                         href={formData.websiteUrl.startsWith('http') ? formData.websiteUrl : `https://${formData.websiteUrl}`} 
                         target="_blank" 
                         rel="noreferrer" 
                         className="underline hover:text-primary"
                       >
                         {formData.websiteUrl}
                       </a>
                     </div>
                   )}
                   
                   <div className="flex items-center gap-2">
                     <Calendar className="h-4 w-4" />
                     <span>Joined {user.createdAt && !isNaN(new Date(user.createdAt).getTime()) ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}</span>
                   </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Wallet Status</span>
                    {user.walletAddress ? (
                      <Badge variant="default">Connected</Badge>
                    ) : (
                      <Badge variant="secondary">Not Connected</Badge>
                    )}
                  </div>
                  
                  {user.walletAddress && (
                    <p className="text-xs text-muted-foreground break-all">
                      {user.walletAddress}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details & Actions */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Important Notifications */}
            {needsNameSetup && (
              <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Setup Your Profile Name
                  </CardTitle>
                  <CardDescription>
                    Please add your name so employers can identify you when you apply for jobs.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            {needsWalletConnection && (
              <Card className="border-gray-600 bg-black text-white">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Connect Your Wallet
                  </CardTitle>
                  <CardDescription className="text-black">
                    Connect your wallet to apply for Web3 jobs and receive payments.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handleWalletConnect}
                    disabled={isConnecting}
                    className="w-full"
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Company Dashboard */}
            {user?.role === 'company' && (
              <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Company Dashboard
                  </CardTitle>
                  <CardDescription>
                    Manage your job postings and company profile
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      onClick={() => navigate('/post-job')}
                      className="w-full"
                      size="lg"
                    >
                      <Briefcase className="mr-2 h-4 w-4" />
                      Post a New Job
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/jobs')}
                      className="w-full"
                      size="lg"
                    >
                      <User className="mr-2 h-4 w-4" />
                      View All Jobs
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>• Post unlimited job listings</p>
                    <p>• Access to premium candidate pool</p>
                    <p>• Verified company badge</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Profile Editor */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Manage your profile details and settings
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    {isEditing ? 'Cancel' : 'Edit'}
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div className="space-y-2">
                     <Label htmlFor="full_name">Full Name</Label>
                     {isEditing ? (
                       <Input
                         id="full_name"
                         value={formData.fullName}
                         onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                         placeholder="Enter your full name"
                       />
                     ) : (
                       <p className="py-2 px-3 bg-muted rounded-md">
                         {formData.fullName || 'Not set'}
                       </p>
                     )}
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                                         {isEditing ? (
                       <Input
                         id="location"
                         value={formData.location}
                         onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                         placeholder="Enter your location"
                       />
                    ) : (
                      <p className="py-2 px-3 bg-muted rounded-md">
                        {formData.location || 'Not set'}
                      </p>
                    )}
                  </div>
                  
                                     <div className="space-y-2">
                     <Label htmlFor="website_url">Website</Label>
                     {isEditing ? (
                       <div>
                         <Input
                           id="website_url"
                           value={formData.websiteUrl}
                           onChange={handleWebsiteChange}
                           placeholder="Enter your website URL (e.g., https://example.com)"
                         />
                         {websiteError && (
                           <p className="text-sm text-red-500 mt-1">{websiteError}</p>
                         )}
                       </div>
                     ) : (
                       <p className="py-2 px-3 bg-muted rounded-md break-all flex items-center gap-2">
                         {formData.websiteUrl ? (
                           <>
                             <ExternalLink className="h-4 w-4" />
                             <a href={formData.websiteUrl.startsWith('http') ? formData.websiteUrl : `https://${formData.websiteUrl}`} target="_blank" rel="noreferrer" className="underline">{formData.websiteUrl}</a>
                           </>
                         ) : 'Not set'}
                       </p>
                     )}
                   </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatar_url">Avatar</Label>
                  {isEditing ? (
                    <div className="flex items-center gap-3">
                      <Input id="avatar_url" type="file" accept="image/*" onChange={handleAvatarChange} />
                      {formData.avatarUrl && <a href={formData.avatarUrl} target="_blank" rel="noreferrer" className="text-sm underline">Preview</a>}
                    </div>
                  ) : (
                    <p className="py-2 px-3 bg-muted rounded-md break-all">
                      {formData.avatarUrl ? 'Uploaded' : 'Not set'}
                    </p>
                  )}
                </div>

                {isEditing && (
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSave} className="flex-1">
                      Save Changes
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditing(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;