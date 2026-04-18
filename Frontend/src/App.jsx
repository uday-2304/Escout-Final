import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  BrowserRouter,
} from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import Program from "./components/programs/Program";
import Footer from "./components/Footer/Footer";
import LiveMetrics from "./components/Counter/LiveMetrics";
import AboutSection from "./components/Info/AboutSection";
import { ToastProvider } from "./components/Toast/ToastContext";

// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import AuthPage from "./pages/Logins";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import ArenaHub from "./pages/ArenaHub";
import OtpPage from "./pages/OtpPage";
import AddVideo from "./pages/AddVideo";
import ResetPasswordPage from "./pages/resetPassword";
import TournamentsPage from "./pages/TournamentsPage";
import RankingsPage from "./pages/RankingsPage";
import ScoutDashboard from "./pages/ScoutDashboard";
import ArenaChat from "./pages/ArenaChat";
import PlayerProfile from "./pages/PlayerProfile";

const AppContent = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw] min-h-screen flex flex-col">
      <Navbar />
      {isHome && (
        <>
          <Hero />
          <Program />
          <LiveMetrics />
          <AboutSection />
          <Footer />
        </>
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/messages" element={<Notifications />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/verify-otp" element={<OtpPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/arena-hub" element={<ArenaHub />} />
        <Route path="/add-video" element={<AddVideo />} />
        <Route path="/tournaments" element={<TournamentsPage />} />
        <Route path="/rankings" element={<RankingsPage />} />
        <Route path="/scout-dashboard" element={<ScoutDashboard />} />
        <Route path="/arena-chat" element={<ArenaChat />} />
        <Route path="/player/:id" element={<PlayerProfile />} />
      </Routes>

    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;