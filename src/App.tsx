import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import PostJob from "./pages/PostJob";
import Profile from "./pages/Profile";
import SavedJobs from "./pages/SavedJobs";
import Settings from "./pages/Settings";
import AboutUs from "./pages/AboutUs";
import Blog from "./pages/Blog";
import HelpCenter from "./pages/HelpCenter";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Contact from "./pages/Contact";
import Notifications from "./pages/Notifications";
import Messages from "./pages/Messages";
import GetVerified from "./pages/GetVerified";
import Billing from "./pages/Billing";
import CompanyProfile from "./pages/CompanyProfile";

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  // Scroll to top whenever the route changes
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  
  return null;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/post-job" element={<PostJob />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/saved-jobs" element={<SavedJobs />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/messages" element={<Messages />} />
  <Route path="/company/:id" element={<CompanyProfile />} />
  <Route path="/get-verified" element={<GetVerified />} />
  <Route path="/billing" element={<Billing />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
