import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedJobs from "@/components/FeaturedJobs";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import GetVerified from './GetVerified';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <FeaturedJobs />
        <Features />
        {/* Remove Route usage here; routing should be handled in your main App or Router component */}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
