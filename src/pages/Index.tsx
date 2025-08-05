import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedJobs from "@/components/FeaturedJobs";
import Features from "@/components/Features";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <FeaturedJobs />
        <Features />
      </main>
    </div>
  );
};

export default Index;
