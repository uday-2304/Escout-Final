import React, { useState } from "react";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaDiscord, FaTwitter, FaLinkedin } from "react-icons/fa";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://escout-esports-scouting-platform-1.onrender.com";

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [status, setStatus] = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
        setStatus("Please fill in all required fields.");
        return;
    }
    setStatus("TRANSMITTING...");
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/users/contact`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });
        if (response.ok) {
            setStatus("MESSAGE SUCCESSFULY TRANSMITTED.");
            setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
            setTimeout(() => setStatus(""), 4000);
        } else {
            setStatus("FAILED TO TRANSMIT. TRY AGAIN.");
        }
    } catch (err) {
        console.error(err);
        setStatus("SYSTEM ERROR. CATASTROPHIC FAILURE.");
    }
  };

  const developers = [
    {
      name: "Uday Tejan",
      role: "Admin and Creator of eScout",
      img: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1000&auto=format&fit=crop",
    }
  ];

  return (
    <div className="contact-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Rajdhani:wght@500;600;700&display=swap');

        :root {
          --red-primary: #c90e1e;
          --bg-black: #050505;
          --bg-dark: #0f0f0f;
          --text-white: #ffffff;
          --glass-bg: rgba(255, 255, 255, 0.03);
          --border-color: #222;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .contact-wrapper {
          background-color: var(--bg-black);
          font-family: 'Rajdhani', sans-serif;
          min-height: 100vh;
          color: var(--text-white);
          padding-top: 80px; /* Space for navbar */
        }

        .container {
          max-width: 1300px;
          margin: 0 auto;
          padding: 0 40px;
        }

        /* === HEADER === */
        .section-header {
          text-align: center;
          margin-bottom: 80px;
        }

        .section-header h1 {
          font-family: 'Teko', sans-serif;
          font-size: clamp(50px, 6vw, 80px);
          line-height: 0.9;
          text-transform: uppercase;
          margin-bottom: 15px;
        }

        .highlight-red {
          color: var(--red-primary);
        }

        .section-header p {
          color: #888;
          font-size: 1.2rem;
          max-width: 600px;
          margin: 0 auto;
        }

        /* === CONTACT GRID === */
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 60px;
          margin-bottom: 120px;
        }

        /* LEFT: INFO BOX */
        .info-panel {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .info-card {
          background: var(--bg-dark);
          padding: 30px;
          border-left: 3px solid var(--red-primary);
          display: flex;
          align-items: flex-start;
          gap: 20px;
          transition: transform 0.3s;
        }

        .info-card:hover {
          transform: translateX(10px);
          background: #111;
        }

        .icon-box {
          font-size: 24px;
          color: var(--red-primary);
          background: rgba(201, 14, 30, 0.1);
          padding: 15px;
          border-radius: 50%;
        }

        .info-content h3 {
          font-family: 'Teko', sans-serif;
          font-size: 24px;
          margin-bottom: 5px;
          text-transform: uppercase;
        }

        .info-content p {
          color: #aaa;
          font-size: 16px;
          line-height: 1.5;
        }

        /* Map Placeholder */
        .map-box {
          height: 200px;
          background-image: url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop');
          background-size: cover;
          background-position: center;
          border: 1px solid var(--border-color);
          position: relative;
          opacity: 0.7;
        }
        
        .map-overlay {
            position: absolute;
            inset: 0;
            background: rgba(201, 14, 30, 0.2);
            mix-blend-mode: overlay;
        }

        /* RIGHT: FORM */
        .form-panel {
          background: var(--bg-dark);
          padding: 50px;
          border: 1px solid var(--border-color);
          position: relative;
        }

        .form-panel::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 100px; height: 3px;
          background: var(--red-primary);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 20px;
        }

        .input-group label {
          font-size: 14px;
          font-weight: 700;
          color: #aaa;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .custom-input, .custom-textarea {
          background: #050505;
          border: 1px solid #333;
          padding: 15px;
          color: #fff;
          font-family: 'Rajdhani', sans-serif;
          font-size: 16px;
          outline: none;
          transition: all 0.3s;
        }

        .custom-input:focus, .custom-textarea:focus {
          border-color: var(--red-primary);
          box-shadow: 0 0 10px rgba(201, 14, 30, 0.2);
        }

        .custom-textarea {
          height: 150px;
          resize: none;
        }

        .submit-btn {
          background: var(--red-primary);
          color: #fff;
          border: none;
          padding: 15px 40px;
          font-family: 'Teko', sans-serif;
          font-size: 20px;
          text-transform: uppercase;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          width: 100%;
          clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
        }

        .submit-btn:hover {
          background: #fff;
          color: #000;
        }

        /* === DEVELOPER TEAM SECTION === */
        .team-section {
          padding-bottom: 100px;
          text-align: center;
        }

        .team-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 40px;
          margin-top: 60px;
        }

        .dev-card {
          background: var(--glass-bg);
          border: 1px solid var(--border-color);
          padding: 40px 20px;
          position: relative;
          transition: transform 0.3s, border-color 0.3s;
          overflow: hidden;
        }

        .dev-card:hover {
          transform: translateY(-10px);
          border-color: var(--red-primary);
        }

        .dev-img-container {
          width: 120px;
          height: 120px;
          margin: 0 auto 20px;
          position: relative;
        }

        .dev-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
          border: 3px solid #333;
          transition: border-color 0.3s;
        }

        .dev-card:hover .dev-img {
          border-color: var(--red-primary);
        }

        .dev-card h3 {
          font-family: 'Teko', sans-serif;
          font-size: 28px;
          text-transform: uppercase;
          margin-bottom: 5px;
        }

        .dev-role {
          color: var(--red-primary);
          font-weight: 700;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 20px;
        }

        .social-links {
          display: flex;
          justify-content: center;
          gap: 15px;
        }

        .social-icon {
          color: #666;
          font-size: 18px;
          transition: color 0.3s;
          cursor: pointer;
        }

        .social-icon:hover {
          color: #fff;
        }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .contact-grid {
            grid-template-columns: 1fr;
          }
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="container">
        
        {/* HEADER */}
        <div className="section-header">
          <h1>Contact <span className="highlight-red">Support</span></h1>
          <p>Have questions about tournaments, scouting, or team management? Our ops team is standing by.</p>
        </div>

        {/* CONTACT CONTENT */}
        <div className="contact-grid">
          
          {/* LEFT SIDE: INFO */}
          <div className="info-panel">
            
            <div className="info-card">
              <div className="icon-box"><FaMapMarkerAlt /></div>
              <div className="info-content">
                <h3>Admin</h3>
                <p>Uday,<br />Hyderabad,Telangana</p>
              </div>
            </div>

            <div className="info-card">
              <div className="icon-box"><FaEnvelope /></div>
              <div className="info-content">
                <h3>Email Us</h3>
                <p>escout88@gmail.com<br />satyateja1707@gmail.com</p>
              </div>
            </div>

            <div className="info-card">
              <div className="icon-box"><FaPhoneAlt /></div>
              <div className="info-content">
                <h3>Call Line</h3>
                <p>967687....<br />Mon-Fri, 9am - 6pm PST</p>
              </div>
            </div>

            <div className="map-box">
                <div className="map-overlay"></div>
            </div>

          </div>

          {/* RIGHT SIDE: FORM */}
          <div className="form-panel">
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="input-group">
                  <label>Full Name *</label>
                  <input type="text" name="name" className="custom-input" placeholder="ENTER NAME" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label>Email Address *</label>
                  <input type="email" name="email" className="custom-input" placeholder="ENTER EMAIL" value={formData.email} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Phone (Optional)</label>
                  <input type="text" name="phone" className="custom-input" placeholder="+1 ..." value={formData.phone} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label>Subject</label>
                  <input type="text" name="subject" className="custom-input" placeholder="RE: INQUIRY" value={formData.subject} onChange={handleChange} />
                </div>
              </div>

              <div className="input-group">
                <label>Message *</label>
                <textarea name="message" className="custom-textarea" placeholder="TYPE YOUR MESSAGE..." value={formData.message} onChange={handleChange} required></textarea>
              </div>

              <button type="submit" className="submit-btn" disabled={status === "TRANSMITTING..."}>
                  {status === "TRANSMITTING..." ? "TRANSMITTING..." : "TRANSMIT MESSAGE"}
              </button>
              {status && <p style={{ marginTop: '15px', color: status.includes('SUCCESS') ? '#00e5ff' : '#ff001f', fontWeight: 'bold' }}>{status}</p>}
            </form>
          </div>

        </div>

        {/* DEVELOPER SECTION */}
        <div className="team-section">
          <div className="section-header">
            <h1>Meet The <span className="highlight-red">Devs</span></h1>
            <p>The architects behind the eScout platform.</p>
          </div>

          <div className="team-grid">
            {developers.map((dev, index) => (
              <div key={index} className="dev-card">
                <div className="dev-img-container">
                  <img src={dev.img} alt={dev.name} className="dev-img" />
                </div>
                <h3>{dev.name}</h3>
                <div className="dev-role">{dev.role}</div>
                
                <div className="social-links">
                  <FaTwitter className="social-icon" />
                  <FaLinkedin className="social-icon" />
                  <FaDiscord className="social-icon" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ContactPage;