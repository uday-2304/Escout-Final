import React from "react";
import "./About.css";
// Use your image paths here
import Img1 from "../../assets/uploadvideo.jpg";
import Img2 from "../../assets/ratings2.jpg";
import Img3 from "../../assets/climbing.jpg";
import Img4 from "../../assets/contract.jpg";
import Profile1 from "../../assets/img2.jpg"; 
import Profile2 from "../../assets/img3.jpg"; 

// --- UPDATED: Focus is on the Player's actions ---
const steps = [
  {
    id: "01",
    title: "UPLOAD HIGHLIGHTS",
    desc: "Build your legacy. Upload your best clips to generate your initial skill profile.",
    img: Img1,
  },
  {
    id: "02",
    title: "GET RATED",
    desc: "Our AI analyzes your mechanics and game sense to assign you a Global Combat Rating.",
    img: Img2,
  },
  {
    id: "03",
    title: "CLIMB THE LADDER",
    desc: "Compete in daily challenges to boost your visibility on the public leaderboards.",
    img: Img3,
  },
  {
    id: "04",
    title: "GET SIGNED",
    desc: "Receive direct contract offers from teams monitoring the top 1% of players.",
    img: Img4,
  },
];

// --- UPDATED: Tools useful for a PLAYER ---
const features = [
  {
    title: "TOURNAMENT RADAR",
    subtitle: "ACTIVE BATTLEZONES",
    desc: "Find open entry tournaments in your region. Filter by prize pool, skill cap, and game mode.",
    icon: "🎯", 
  },
  {
    title: "GLOBAL RANKINGS",
    subtitle: "KNOW YOUR ENEMY",
    desc: "See where you stand against the world's best. Compare your stats directly with pro players.",
    icon: "📈",
  },
  {
    title: "OPEN TRYOUTS",
    subtitle: "RECRUITMENT DRIVES",
    desc: "A live feed of teams currently looking for specific roles (IGL, Entry, Support). Apply with one click.",
    icon: "📢",
  },
];

// --- UPDATED: "Hall of Valor" - Inspiration for the player ---
const hallOfValor = [
  {
    player: "VIPER",
    origin: "RANK: DIAMOND",
    current: "NOW: TIER 1 PRO",
    story: "Started with 0 earnings. Grind 6 months on eScout. Now starting roster for Cloud9.",
    img: Profile1,
  },
  {
    player: "NOVA",
    origin: "RANK: IMMORTAL",
    current: "NOW: ACADEMY LEAD",
    story: "Used our Scrim Finder to build a squad. They got picked up by 100 Thieves.",
    img: Profile2,
  },
];

const EScoutPage = () => {
  return (
    <div className="es-container">
      {/* --- HERO / ONBOARDING --- */}
      <section className="es-section about-section">
        <div className="es-header-group">
          <h2 className="es-heading">
            BEGIN YOUR <span className="text-red">ASCENT</span>
          </h2>
          <div className="red-divider"></div>
          <p className="es-subtitle">
            THE PATH FROM SOLO QUEUE TO THE MAIN STAGE STARTS HERE.
          </p>
        </div>

        <div className="es-grid">
          {steps.map((step, index) => (
            <div className="es-card" key={index}>
              <div className="card-image-wrapper">
                <img src={step.img} alt={step.title} />
                <div className="img-overlay"></div>
                <span className="step-number">{step.id}</span>
              </div>
              <div className="card-content">
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
                <div className="deco-corner"></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- PLAYER TOOLKIT --- */}
      <section className="es-section features-section">
        <div className="intel-background-text">ARMORY</div>
        
        <div className="es-header-group right-align">
          <h2 className="es-heading">YOUR <span className="text-red">ARSENAL</span></h2>
          <p className="es-subtitle">EVERYTHING YOU NEED TO DOMINATE THE COMPETITION</p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div className="feature-card" key={index}>
              <div className="feature-icon">{feature.icon}</div>
              <div className="feature-text">
                <h4 className="feature-sub">{feature.subtitle}</h4>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.desc}</p>
              </div>
              <div className="scan-line"></div>
            </div>
          ))}
        </div>
      </section>

      {/* --- NEW SECTION: PROVING GROUNDS (Scrims) --- */}
      <section className="es-section scrim-section">
        <div className="scrim-banner">
          <div className="scrim-content">
            <h3>PROVING GROUNDS</h3>
            <p>NEED PRACTICE? FIND HIGH-ELO SCRIMS & 1v1 DUELS INSTANTLY.</p>
            <button className="btn-red-outline">ENTER LOBBY</button>
          </div>
        </div>
      </section>

   
    </div>
  );
};

export default EScoutPage;