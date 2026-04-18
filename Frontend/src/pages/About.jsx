import React, { useState } from "react";
import { FaArrowRight, FaCrosshairs, FaGamepad, FaTrophy, FaChevronDown, FaChevronUp } from "react-icons/fa";

// Placeholder images for the accordion sections
const ECO_IMG = "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=1000&auto=format&fit=crop";
const JOIN_IMG = "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=1000&auto=format&fit=crop";
const PRIZE_IMG = "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1000&auto=format&fit=crop";

const AboutPage = () => {
  // State to track which accordion is open (null = all closed)
  const [activeAccordion, setActiveAccordion] = useState(null);

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  const menuItems = [
    {
      id: 1,
      title: "THE ECOSYSTEM",
      desc: "Learn how players, scouts, and teams interact.",
      details: "Our ecosystem is a closed loop of value. Players upload stats, Scouts verify data, and Teams recruit the verified talent. It's a meritocracy built on performance, not connections.",
      img: ECO_IMG
    },
    {
      id: 2,
      title: "HOW TO JOIN",
      desc: "Create your profile and upload your first clip.",
      details: "1. Register an account. 2. Link your game ID (Riot, Steam, etc.). 3. Upload your best clips. 4. Wait for Scout verification. Once verified, you appear on the global leaderboard.",
      img: JOIN_IMG
    },
    {
      id: 3,
      title: "WINNER PRIZE",
      desc: "Monthly tournaments with cash pools.",
      details: "Top-ranked players qualify for our Monthly Showdown. Prize pools start at $5,000 and include direct tryout invitations from partner organizations like Cloud9 and Liquid.",
      img: PRIZE_IMG
    }
  ];

  return (
    <div className="about-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Rajdhani:wght@500;600;700&display=swap');

        :root {
          /* CHANGED: Decreased intensity (Deep Crimson instead of Neon) */
          --red-primary: #a6000e; 
          --bg-black: #050505;
          --bg-dark: #0f0f0f;
          --text-white: #ffffff;
          --text-black: #000000;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .about-wrapper {
          background-color: var(--bg-black);
          font-family: 'Rajdhani', sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* === GRID LAYOUT === */
        .poster-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr; /* 60% Left, 40% Right */
          min-height: 100vh;
        }

        /* === LEFT SECTION (RED & BLACK GRADIENT) === */
        .left-panel {
          /* CHANGED: From solid color to Gradient */
          background: linear-gradient(135deg, var(--red-primary) 0%, #2b0000 60%, #000000 100%);
          /* CHANGED: Text to white so it is readable on the dark gradient */
          color: var(--text-white);
          padding: 60px;
          position: relative;
          display: flex;
          flex-direction: column;
          border-right: 4px solid #000;
        }

        .brand-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 60px;
          border-bottom: 3px solid rgba(255, 255, 255, 0.2); /* Adjusted border for contrast */
          padding-bottom: 20px;
        }

        .brand-header h2 {
          font-family: 'Teko', sans-serif;
          font-size: 24px;
          font-weight: 700;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .hero-title {
          font-family: 'Teko', sans-serif;
          font-size: clamp(60px, 8vw, 110px);
          font-weight: 700;
          line-height: 0.85;
          text-transform: uppercase;
          margin-bottom: 40px;
          text-shadow: 0 5px 15px rgba(0,0,0,0.5); /* Added shadow for readability */
        }

        .hero-image-block {
          width: 100%;
          height: 350px;
          background-image: url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670&auto=format&fit=crop');
          background-size: cover;
          background-position: center;
          border: 4px solid #000;
          position: relative;
          margin-bottom: 40px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.6);
        }

        .image-tag {
          position: absolute;
          top: 20px;
          left: 20px;
          background: #000;
          color: var(--red-primary);
          padding: 5px 15px;
          font-weight: 700;
          font-size: 12px;
        }

        .big-text {
          font-family: 'Teko', sans-serif;
          font-size: clamp(50px, 6vw, 90px);
          font-weight: 700;
          text-transform: uppercase;
          line-height: 0.9;
          margin-top: 20px;
          border-top: 2px solid rgba(255, 255, 255, 0.1);
          padding-top: 20px;
          color: rgba(255, 255, 255, 0.1); /* Watermark effect */
        }

        .feature-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-top: 40px;
        }

        .feature-item h3 {
          font-family: 'Teko', sans-serif;
          font-size: 32px;
          text-transform: uppercase;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .feature-item p {
          font-size: 16px;
          font-weight: 600;
          line-height: 1.4;
          color: #ccc;
        }

        /* === RIGHT SECTION (BLACK DOMINANT) === */
        .right-panel {
          background-color: var(--bg-black);
          color: var(--text-white);
          display: flex;
          flex-direction: column;
        }

        .cta-box {
          /* Added gradient to CTA box as well to match */
          background: linear-gradient(90deg, #1d1d1d 0%);
          color: #fff;
          padding: 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: 'Teko', sans-serif;
          font-size: 30px;
          font-weight: 700;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s;
        }

        .cta-box:hover {
          background: #fff;
          color: var(--red-primary);
        }

        .menu-list {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        /* --- ACCORDION STYLES --- */
        .menu-item {
          border-bottom: 1px solid #333;
          background: #050505;
          transition: background 0.3s;
        }

        .menu-header {
          padding: 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
        }

        .menu-header:hover {
          background-color: #111;
        }

        .menu-icon {
          background: #333;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--red-primary);
          transition: transform 0.3s;
        }

        .menu-text h4 {
          font-family: 'Teko', sans-serif;
          font-size: 24px;
          text-transform: uppercase;
          margin-bottom: 5px;
          color: #fff;
        }

        .menu-text p {
          color: #888;
          font-size: 14px;
        }

        /* Expanded Content ("Down Box") */
        .accordion-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.5s ease-in-out;
          background: #0a0a0a;
          border-bottom: 1px solid #222;
        }

        .accordion-content.open {
          max-height: 500px; /* Large enough to fit content */
        }

        .info-box {
          padding: 30px 40px;
          color: #ccc;
        }

        .info-text {
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 20px;
          border-left: 3px solid var(--red-primary);
          padding-left: 15px;
        }

        .info-img {
          width: 100%;
          height: 200px;
          object-fit: cover;
          border: 1px solid #333;
          border-radius: 4px;
          filter: grayscale(100%);
          transition: filter 0.3s;
        }

        .info-img:hover {
          filter: grayscale(0%);
        }

        /* Vertical Text */
        .vertical-text-area {
          flex: 1;
          background-color: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          padding: 40px;
        }

        .vertical-text {
          font-family: 'Teko', sans-serif;
          font-size: 120px;
          line-height: 0.8;
          font-weight: 700;
          text-transform: uppercase;
          color: transparent;
          -webkit-text-stroke: 2px var(--red-primary);
          text-align: left;
        }
        
        .solid-text {
            color: var(--red-primary);
            -webkit-text-stroke: 0;
        }

        .footer-strip {
          background: var(--red-primary);
          color: #000;
          padding: 20px;
          text-align: right;
        }

        .footer-strip svg {
          font-size: 40px;
          transform: rotate(45deg);
        }

        /* === RESPONSIVE === */
        @media (max-width: 1024px) {
          .poster-grid {
            grid-template-columns: 1fr;
          }
          .vertical-text-area {
            display: none;
          }
          .hero-title { font-size: 70px; }
        }
      `}</style>

      <div className="poster-grid">
        
        {/* --- LEFT PANEL (RED) --- */}
        <div className="left-panel">
          <div className="brand-header">
            <h2><FaGamepad /> ESCOUT // ABOUT</h2>
            <span>EST. 2025</span>
          </div>

          <h1 className="hero-title">
            READY, SET,<br />
            GAME: CONQUER<br />
            THE BATTLEFIELD
          </h1>

          <div className="hero-image-block">
            <div className="image-tag">ON FRAME: FNATIC VS SENTINELS</div>
          </div>

          <div className="feature-row">
            <div className="feature-item">
              <h3><FaCrosshairs /> WHO WE ARE</h3>
              <p>We are the bridge between solo queue and the main stage. eScout is the definitive platform for discovering the next generation of eSports talent.</p>
            </div>
            <div className="feature-item">
              <h3><FaTrophy /> OUR MISSION</h3>
              <p>To democratize scouting. We use data-driven analytics to ensure skill is the only metric that matters. If you're good enough, you'll be found.</p>
            </div>
          </div>

          <div className="big-text">
            ABOUT THE PLATFORM
          </div>
        </div>

        {/* --- RIGHT PANEL (BLACK - Interactive) --- */}
        <div className="right-panel">
          
          {/* Join CTA (Acts as a header for interactions) */}
          <div className="cta-box">
            <span>EXPLORE OPPORTUNITIES</span>
            <FaArrowRight />
          </div>

          <div className="menu-list">
            {menuItems.map((item) => (
              <div className="menu-item" key={item.id}>
                
                {/* Clickable Header */}
                <div className="menu-header" onClick={() => toggleAccordion(item.id)}>
                  <div className="menu-text">
                    <h4>{item.title}</h4>
                    <p>{item.desc}</p>
                  </div>
                  <div className="menu-icon">
                    {activeAccordion === item.id ? <FaChevronUp /> : <FaChevronDown />}
                  </div>
                </div>

                {/* Dropdown Content */}
                <div className={`accordion-content ${activeAccordion === item.id ? "open" : ""}`}>
                  <div className="info-box">
                    <p className="info-text">{item.details}</p>
                    <img src={item.img} alt={item.title} className="info-img" />
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Large Vertical Text Effect */}
          <div className="vertical-text-area">
            <div className="vertical-text">
              JOIN<br />
              <span className="solid-text">THE</span><br />
              BATTLE
            </div>
          </div>

          {/* Bottom Arrow Strip */}
          <div className="footer-strip">
            <FaArrowRight />
          </div>

        </div>

      </div>
    </div>
  );
};

export default AboutPage;