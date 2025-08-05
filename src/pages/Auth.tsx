import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Wallet, User, Mail, Lock, UserPlus } from 'lucide-react';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { user, signIn, signUp, signInWithWallet } = useAuth();
  const { connectWallet, isConnected, walletAddress, isConnecting } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password, fullName);
      } else {
        await signIn(email, password);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleWalletConnect = async () => {
    try {
      const result = await connectWallet();
      if (result.success && result.address) {
        // Authenticate user with wallet address
        await signInWithWallet(result.address);
        // Navigation will happen automatically via useEffect when user state changes
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/90 to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">
            Welcome to AVAX Forge Jobs
          </CardTitle>
          <CardDescription>
            Connect your wallet or sign in to access the platform
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="wallet" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="wallet">Wallet</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
            </TabsList>
            
            <TabsContent value="wallet" className="space-y-4">
              <div className="space-y-4">
                <Button
                  onClick={handleWalletConnect}
                  disabled={isConnecting || isConnected}
                  className="w-full"
                  size="lg"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  {isConnecting ? 'Connecting...' : 
                   isConnected ? `Connected: ${walletAddress?.slice(0, 6)}...${walletAddress?.slice(-4)}` :
                   'Connect MetaMask'}
                </Button>
                
                {isConnected && (
                  <div className="text-center text-sm text-muted-foreground">
                    <p>Wallet connected successfully!</p>
                    <p className="break-all">{walletAddress}</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="email" className="space-y-4">
              <form onSubmit={handleAuth} className="space-y-4">
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                  size="lg"
                >
                  {loading ? 'Please wait...' : 
                   isSignUp ? (
                     <>
                       <UserPlus className="mr-2 h-4 w-4" />
                       Create Account
                     </>
                   ) : (
                     <>
                       <User className="mr-2 h-4 w-4" />
                       Sign In
                     </>
                   )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <Separator />
          <div className="text-center text-sm">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary hover:underline"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;