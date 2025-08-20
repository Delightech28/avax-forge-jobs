import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Briefcase, Building2, Globe, MapPin, Users, Industry } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import { db } from '@/integrations/firebase/client';
import { collection, addDoc } from 'firebase/firestore';

const CreateCompany = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth?redirectTo=/companies/new");
      return;
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    website_url: "",
    location: "",
    industry: "",
    size_range: "",
    logo_url: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const companyData = {
        ...formData,
        created_by: user?.id,
        created_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'companies'), companyData);
      toast.success("Company profile created successfully!");
      navigate("/post-job");
    } catch (error) {
      console.error("Error creating company:", error);
      toast.error("Failed to create company profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
            <p className="text-muted-foreground mb-6">You need to be signed in to create a company profile.</p>
            <Button onClick={() => navigate("/auth?redirectTo=/companies/new")} size="lg">
              Sign In to Create Company
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header Section */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Create Company Profile
            </h1>
            <p className="text-xl text-muted-foreground">
              Set up your company profile to start posting jobs and attracting top talent
            </p>
          </div>

          <Card className="border-2 border-primary/10">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Company Information
              </CardTitle>
              <CardDescription>
                Tell candidates about your company and what makes it special
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base font-medium">
                    Company Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="e.g. DeFi Protocol Labs"
                    className="h-12 text-lg"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-base font-medium">
                    Company Description *
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Describe your company, mission, and what makes it exciting to work for..."
                    rows={4}
                    className="text-base"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="website_url">Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="website_url"
                        type="url"
                        value={formData.website_url}
                        onChange={(e) => handleInputChange("website_url", e.target.value)}
                        placeholder="https://example.com"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        placeholder="e.g. San Francisco, CA"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select 
                      value={formData.industry} 
                      onValueChange={(value) => handleInputChange("industry", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="defi">DeFi</SelectItem>
                        <SelectItem value="web3">Web3</SelectItem>
                        <SelectItem value="ai">Artificial Intelligence</SelectItem>
                        <SelectItem value="fintech">Fintech</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="ecommerce">E-commerce</SelectItem>
                        <SelectItem value="gaming">Gaming</SelectItem>
                        <SelectItem value="enterprise">Enterprise Software</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="size_range">Company Size</Label>
                    <Select 
                      value={formData.size_range} 
                      onValueChange={(value) => handleInputChange("size_range", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 employees</SelectItem>
                        <SelectItem value="11-50">11-50 employees</SelectItem>
                        <SelectItem value="51-200">51-200 employees</SelectItem>
                        <SelectItem value="201-500">201-500 employees</SelectItem>
                        <SelectItem value="501-1000">501-1000 employees</SelectItem>
                        <SelectItem value="1000+">1000+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo_url">Logo URL (Optional)</Label>
                  <Input
                    id="logo_url"
                    type="url"
                    value={formData.logo_url}
                    onChange={(e) => handleInputChange("logo_url", e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="flex-1 h-12 text-lg font-semibold"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Creating...
                      </div>
                    ) : (
                      <>
                        <Building2 className="mr-2 h-5 w-5" />
                        Create Company Profile
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate("/post-job")}
                    className="h-12"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CreateCompany;
