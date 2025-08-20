// Firebase Seed Script - Run this in your browser console after setting up Firebase
// This will create sample companies and jobs for testing

// Make sure you're signed in to Firebase first
// Then run this in your browser console

const seedData = async () => {
  try {
    // Sample companies
    const companies = [
      {
        name: "DeFi Protocol Labs",
        description: "Building the next generation of DeFi protocols on Avalanche. We're focused on creating innovative financial products that are secure, scalable, and user-friendly.",
        website_url: "https://defiprotocol.com",
        location: "San Francisco, CA",
        industry: "defi",
        size_range: "11-50",
        logo_url: "https://via.placeholder.com/150x150/3B82F6/FFFFFF?text=DFP",
        created_at: new Date().toISOString(),
      },
      {
        name: "Avalanche Forge",
        description: "Leading Web3 development company specializing in Avalanche ecosystem projects. We help startups and enterprises build on the fastest blockchain.",
        website_url: "https://avalancheforge.com",
        location: "Remote",
        industry: "web3",
        size_range: "1-10",
        logo_url: "https://via.placeholder.com/150x150/10B981/FFFFFF?text=AF",
        created_at: new Date().toISOString(),
      },
      {
        name: "Smart Contract Solutions",
        description: "Expert smart contract development and auditing services. We help projects launch safely and securely on multiple blockchains.",
        website_url: "https://smartcontractsolutions.com",
        location: "New York, NY",
        industry: "web3",
        size_range: "51-200",
        logo_url: "https://via.placeholder.com/150x150/F59E0B/FFFFFF?text=SCS",
        created_at: new Date().toISOString(),
      }
    ];

    // Sample jobs
    const jobs = [
      {
        title: "Senior Smart Contract Developer",
        description: "Join our team building the next generation of DeFi protocols on Avalanche. Looking for experienced Solidity developers who are passionate about DeFi and blockchain technology.",
        company_id: "COMPANY_ID_1", // Will be replaced with actual ID
        job_type: "full_time",
        location_type: "remote",
        location: "Remote",
        salary_min: 120000,
        salary_max: 180000,
        salary_currency: "USD",
        experience_level: "senior",
        skills: ["Solidity", "Web3", "DeFi", "Avalanche", "JavaScript", "TypeScript"],
        requirements: "5+ years of smart contract development experience, deep understanding of DeFi protocols, experience with Avalanche C-Chain",
        benefits: "Competitive salary, equity, health insurance, flexible hours, remote work",
        token_compensation: "AVAX",
        token_amount: 1000,
        requires_wallet: true,
        created_at: new Date().toISOString(),
        posted_by: "USER_ID", // Will be replaced with actual user ID
      },
      {
        title: "Frontend Developer - Web3",
        description: "Build beautiful, responsive user interfaces for our DeFi applications. Work with modern frameworks and Web3 technologies.",
        company_id: "COMPANY_ID_2",
        job_type: "full_time",
        location_type: "hybrid",
        location: "San Francisco, CA",
        salary_min: 80000,
        salary_max: 130000,
        salary_currency: "USD",
        experience_level: "mid",
        skills: ["React", "TypeScript", "Web3.js", "Ethers.js", "Tailwind CSS", "Next.js"],
        requirements: "3+ years of frontend development, experience with Web3 libraries, strong React skills",
        benefits: "Competitive salary, health insurance, 401k, flexible PTO",
        token_compensation: "",
        token_amount: null,
        requires_wallet: false,
        created_at: new Date().toISOString(),
        posted_by: "USER_ID",
      }
    ];

    console.log("Starting to seed data...");

    // Add companies first
    const companyRefs = [];
    for (const company of companies) {
      const docRef = await addDoc(collection(db, 'companies'), company);
      companyRefs.push(docRef);
      console.log(`Added company: ${company.name} with ID: ${docRef.id}`);
    }

    // Add jobs with correct company IDs
    for (let i = 0; i < jobs.length; i++) {
      const job = { ...jobs[i] };
      job.company_id = companyRefs[i]?.id || companyRefs[0]?.id;
      
      const docRef = await addDoc(collection(db, 'jobs'), job);
      console.log(`Added job: ${job.title} with ID: ${docRef.id}`);
    }

    console.log("✅ Seeding completed successfully!");
    console.log("Companies created:", companyRefs.map(ref => ref.id));
    
  } catch (error) {
    console.error("❌ Error seeding data:", error);
  }
};

// Run this function in your browser console
// seedData();

console.log("Firebase seed script loaded. Run 'seedData()' in the console to populate sample data.");
