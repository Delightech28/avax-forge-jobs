import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Wallet, User, Mail, MapPin, Calendar, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { connectWallet, isConnected, walletAddress, isConnecting } = useWallet();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    bio: '',
    location: '',
    website_url: '',
  });

  useEffect(() => {
    if (user?.profile) {
      setFormData({
        full_name: user.profile.full_name || '',
        username: user.profile.username || '',
        bio: user.profile.bio || '',
        location: user.profile.location || '',
        website_url: user.profile.website_url || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    const { error } = await updateProfile(formData);
    if (!error) {
      setIsEditing(false);
    }
  };

  const handleWalletConnect = async () => {
    const result = await connectWallet();
    if (result.success) {
      toast.success('Wallet connected successfully!');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please sign in to view your profile.</p>
      </div>
    );
  }

  // Check if user signed up with wallet (no email) or email
  const signedUpWithWallet = !user.email;
  const needsNameSetup = signedUpWithWallet && !user.profile?.full_name;
  const needsWalletConnection = !signedUpWithWallet && !isConnected;

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
                  <AvatarImage src={user.profile?.avatar_url} />
                  <AvatarFallback className="text-2xl">
                    {user.profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl">
                  {user.profile?.full_name || user.email?.split('@')[0] || 'Anonymous User'}
                </CardTitle>
                <CardDescription>
                  {user.profile?.username && `@${user.profile.username}`}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {user.profile?.bio && (
                  <p className="text-sm text-muted-foreground">{user.profile.bio}</p>
                )}
                
                <div className="space-y-2 text-sm">
                  {user.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{user.email}</span>
                    </div>
                  )}
                  
                  {user.profile?.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{user.profile.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {new Date(user.created_at || '').toLocaleDateString()}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Wallet Status</span>
                    {isConnected ? (
                      <Badge variant="default">Connected</Badge>
                    ) : (
                      <Badge variant="secondary">Not Connected</Badge>
                    )}
                  </div>
                  
                  {isConnected && walletAddress && (
                    <p className="text-xs text-muted-foreground break-all">
                      {walletAddress}
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
              <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Connect Your Wallet
                  </CardTitle>
                  <CardDescription>
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
                        value={formData.full_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <p className="py-2 px-3 bg-muted rounded-md">
                        {formData.full_name || 'Not set'}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    {isEditing ? (
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                        placeholder="Enter your username"
                      />
                    ) : (
                      <p className="py-2 px-3 bg-muted rounded-md">
                        {formData.username || 'Not set'}
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
                      <Input
                        id="website_url"
                        value={formData.website_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                        placeholder="Enter your website URL"
                      />
                    ) : (
                      <p className="py-2 px-3 bg-muted rounded-md">
                        {formData.website_url || 'Not set'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  ) : (
                    <div className="py-2 px-3 bg-muted rounded-md min-h-[100px]">
                      {formData.bio || 'No bio set'}
                    </div>
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