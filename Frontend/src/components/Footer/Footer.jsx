import React from "react";
import "./Footer.css";
import { FaInstagram, FaTwitter, FaYoutube, FaDiscord, FaArrowRight, FaEnvelope } from "react-icons/fa";

import FooterImg from "../../assets/Footer.jpg"; 

const Footer = () => {

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <footer className="footer-wrapper">
      
      {/* === BANNER SECTION === */}
      <div className="footer-banner" style={{ backgroundImage: `url(${FooterImg})` }}>
        
        {/* The overlay handles the Red Background + Yellow Sun effect */}
        <div className="banner-overlay">
          <div className="cta-content">
            <h2 className="cta-title">THE ARENA <span className="text-stroke">AWAITS</span></h2>
            <p className="cta-desc">
              Don't just spectate. Upload your clips, get ranked, and join the elite. 
            </p>
            
          </div>
        </div>
      </div>

      {/* === MAIN FOOTER UI (Black Background) === */}
      <div className="footer-body">
        <div className="footer-grid">
          
          {/* 1. BRANDING */}
          <div className="footer-column brand-col">
            <h1 className="footer-logo">ESCOUT</h1>
            <p className="brand-text">
              Global eSports scouting platform. We connect high-ELO talent with 
              tier-1 organizations through data-driven analysis.
            </p>
            <div className="social-row">
              <a href="#" className="social-icon discord"><FaDiscord /></a>
              <a href="#" className="social-icon twitter"><FaTwitter /></a>
              <a href="#" className="social-icon youtube"><FaYoutube /></a>
              <a href="#" className="social-icon insta"><FaInstagram /></a>
            </div>
          </div>

          {/* 2. NAVIGATION */}
          <div className="footer-column">
            <h3 className="col-header">PLATFORM</h3>
            <ul className="footer-links">
              <li><a href="#">Tournaments</a></li>
              <li><a href="#">Leaderboards</a></li>
              <li><a href="#">Team Finder</a></li>
              <li><a href="#">Premium Access</a></li>
            </ul>
          </div>

          {/* 3. SUPPORT */}
          <div className="footer-column">
            <h3 className="col-header">SUPPORT</h3>
            <ul className="footer-links">
              <li><a href="#">Help Center</a></li>
              <li><a href="#">API Documentation</a></li>
              <li><a href="#">Community Guidelines</a></li>
              <li><a href="#">Contact Us</a></li>
            </ul>
          </div>

          {/* 4. NEWSLETTER */}
          <div className="footer-column newsletter-col">
            <h3 className="col-header">INTEL UPDATE</h3>
            <p className="newsletter-text">Get weekly reports on top players and upcoming scrims.</p>
            <form className="newsletter-form">
              <div className="input-wrapper">
                <FaEnvelope className="input-icon" />
                <input type="email" placeholder="ENTER EMAIL..." />
                <button type="button" className="send-btn"><FaArrowRight /></button>
              </div>
            </form>
          </div>

        </div>

        {/* BOTTOM BAR */}
        <div className="footer-bottom">
          <div className="copyright">
            <p>&copy; 2025 ESCOUT SYSTEMS. ALL RIGHTS RESERVED.</p>
          </div>
          <div className="legal">
            <a href="#">PRIVACY</a>
            <span className="divider">/</span>
            <a href="#">TERMS</a>
            <span className="divider">/</span>
            <a href="#">SITEMAP</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;