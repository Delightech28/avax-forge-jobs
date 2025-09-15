import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Wallet, User, Mail, Lock, UserPlus, Briefcase } from 'lucide-react';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [userRole, setUserRole] = useState<'user' | 'company'>('user');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Password strength checker state
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  
  const { user, loading, signIn, signUp, signInWithWallet } = useAuth();
  const navigate = useNavigate();
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Password reset modal state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  useEffect(() => {
    console.log('Auth useEffect - user:', user, 'loading:', loading);
    
    if (user && !loading) {
      console.log('User authenticated, redirecting...');
      // Check if there's a redirect URL in the URL params
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get('redirectTo');
      if (redirectTo) {
        console.log('Redirecting to:', redirectTo);
        navigate(redirectTo);
      } else {
        console.log('Redirecting to home');
        navigate('/');
      }
    }
  }, [user, loading, navigate]);

  // Password strength checker function
  const checkPasswordStrength = (password: string) => {
    setPasswordChecks({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (isSignUp) {
      checkPasswordStrength(newPassword);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(''); // Clear previous errors

    try {
      if (isSignUp) {
        const result = await signUp(email, password, fullName, userRole);
        if (result.error) {
          setErrorMessage(result.error.message || 'Failed to create account');
        } else {
          // Clear form after successful signup
          clearForm();
        }
      } else {
        const result = await signIn(email, password);
        if (result.error) {
          setErrorMessage(result.error.message || 'Failed to sign in');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleWalletConnect = async () => {
    try {
      setErrorMessage(''); // Clear previous errors
      setIsConnecting(true);
      
      // Fix window as any
      if (!(window as Window & { ethereum?: unknown }).ethereum) {
        setErrorMessage('MetaMask not found. Please install MetaMask extension.');
        return;
      }
      const provider = (window as Window & { ethereum: { request: (args: { method: string }) => Promise<string[]> } }).ethereum;
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      
      if (address) {
        setWalletAddress(address);
        const authResult = await signInWithWallet(address);
        if (authResult.error) {
          const errorMessageText =
            typeof authResult.error === 'object' &&
            authResult.error !== null &&
            'message' in authResult.error
              ? (authResult.error as { message?: string }).message
              : undefined;
          setErrorMessage(errorMessageText || 'Failed to authenticate with wallet');
        }
        // Navigation will happen automatically via useEffect when user state changes
      }
    } catch (error) {
      // Fix error: any in wallet connect
      if (typeof error === 'object' && error !== null && 'code' in error && (error as { code?: unknown }).code === 4001) {
        setErrorMessage('Wallet connection was rejected');
      } else {
        setErrorMessage('Failed to connect wallet. Please try again.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetSubmitting(true);
    setResetMessage('');
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage('Password reset email sent! Check your inbox.');
    } catch (err) {
      // Fix error: any in password reset
      if (typeof err === 'object' && err !== null && 'message' in err) {
        setResetMessage((err as { message?: string }).message || 'Failed to send reset email');
      } else {
        setResetMessage('Failed to send reset email');
      }
    } finally {
      setResetSubmitting(false);
    }
  };

  const clearForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setPasswordChecks({
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false
    });
    setErrorMessage('');
  };

  const getFullNameConfig = () => {
    if (userRole === 'user') {
      return {
        label: 'Full Name',
        icon: <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />,
        placeholder: 'John Doe'
      };
    } else {
             return {
         label: 'Company Name',
         icon: <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />,
         placeholder: 'Avax Forge Jobs'
       };
    }
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/90 to-primary/5 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Loading...</CardTitle>
            <CardDescription>
              Checking authentication status...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                  disabled={isConnecting || !!walletAddress}
                  className="w-full"
                  size="lg"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  {isConnecting ? 'Connecting...' : 
                   walletAddress ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` :
                   'Connect MetaMask'}
                </Button>
                
                {walletAddress && (
                  <div className="text-center text-sm text-muted-foreground">
                    <p>Wallet connected successfully!</p>
                    <p className="break-all">{walletAddress}</p>
                  </div>
                )}
                
                {/* Error message display for wallet */}
                {errorMessage && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <p className="text-sm text-destructive text-center">{errorMessage}</p>
                  </div>
                )}
                

              </div>
            </TabsContent>
            
            <TabsContent value="email" className="space-y-4">
              <form onSubmit={handleAuth} className="space-y-4">
                {isSignUp && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="fullName">{getFullNameConfig().label}</Label>
                      <div className="relative">
                        {getFullNameConfig().icon}
                        <Input
                          id="fullName"
                          type="text"
                          placeholder={getFullNameConfig().placeholder}
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>I am looking to:</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <div
                          className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                            userRole === 'user'
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => setUserRole('user')}
                        >
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span className="font-medium">Find Jobs</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            I'm a job seeker
                          </p>
                        </div>
                        <div
                          className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                            userRole === 'company'
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => setUserRole('company')}
                        >
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            <span className="font-medium">Hire Talent</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            I'm an employer
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
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
                      onChange={handlePasswordChange}
                      className="pl-10"
                      required
                      minLength={8}
                    />
                  </div>
                  {isSignUp && (
                    <div className="text-xs space-y-1">
                      <p className="font-medium">Password must contain:</p>
                      <ul className="space-y-0.5">
                        <li className={`flex items-center gap-2 ${passwordChecks.length ? 'text-green-600' : 'text-red-500'}`}>
                          <span className={`w-2 h-2 rounded-full ${passwordChecks.length ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          At least 8 characters
                        </li>
                        <li className={`flex items-center gap-2 ${passwordChecks.uppercase ? 'text-green-600' : 'text-red-500'}`}>
                          <span className={`w-2 h-2 rounded-full ${passwordChecks.uppercase ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          One uppercase letter (A-Z)
                        </li>
                        <li className={`flex items-center gap-2 ${passwordChecks.lowercase ? 'text-green-600' : 'text-red-500'}`}>
                          <span className={`w-2 h-2 rounded-full ${passwordChecks.lowercase ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          One lowercase letter (a-z)
                        </li>
                        <li className={`flex items-center gap-2 ${passwordChecks.number ? 'text-green-600' : 'text-red-500'}`}>
                          <span className={`w-2 h-2 rounded-full ${passwordChecks.number ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          One number (0-9)
                        </li>
                        <li className={`flex items-center gap-2 ${passwordChecks.special ? 'text-green-600' : 'text-red-500'}`}>
                          <span className={`w-2 h-2 rounded-full ${passwordChecks.special ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          One special character (!@#$%^&amp;*(),.?":{}|&lt;&gt;)
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end mb-4">
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline"
                    onClick={() => setShowResetModal(true)}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                  >
                    Forgot password?
                  </button>
                </div>
                
                <Button
                   type="submit"
                   className="w-full"
                   disabled={submitting}
                   size="lg"
                 >
                   {submitting ? 'Please wait...' : 
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
                
                {/* Error message display */}
                  {errorMessage && errorMessage !== 'Invalid email or password. Please check your credentials and try again.' && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                      <p className="text-sm text-destructive text-center">{errorMessage}</p>
                    </div>
                  )}
                
                {/* Helpful guidance text */}
                <div className="text-xs text-muted-foreground text-center space-y-1 pt-2">
                  {isSignUp ? (
                    <>
                    </>
                  ) : (
                    <>
                      <p>Forgot your password? You'll need to create a new account</p>
                      <p>Don't have an account? Switch to "Create Account" above</p>
                    </>
                  )}
                </div>
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
      
      {/* Password reset modal (simple inline modal) */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
          <div className="bg-black rounded-lg p-6 w-full max-w-sm shadow-lg relative border border-white/10">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
              onClick={() => { setShowResetModal(false); setResetEmail(''); setResetMessage(''); }}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-lg font-semibold mb-2 text-center text-white">Reset Password</h2>
            <form onSubmit={handlePasswordReset} className="space-y-3">
              <Label htmlFor="resetEmail" className="text-white">Email</Label>
              <Input
                id="resetEmail"
                type="email"
                value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
                required
              />
              <Button type="submit" disabled={resetSubmitting} className="w-full">
                {resetSubmitting ? 'Sending...' : 'Send Reset Email'}
              </Button>
            </form>
            {resetMessage && <div className="mt-3 text-sm text-center text-primary">{resetMessage}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default Auth;