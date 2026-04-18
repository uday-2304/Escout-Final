import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserAstronaut, FaSignOutAlt, FaShieldAlt, FaEnvelope } from 'react-icons/fa';
import LoginGate from '../components/LoginGate';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  if (!token) return <LoginGate />;

  useEffect(() => {
    fetch("https://escout-esports-scouting-platform-1.onrender.com/api/v1/users/me", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setUser(data.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <div className="profile-page">
      <div className="profile-container">

        {/* HEADER */}
        <div className="p-header">
          <div className="p-icon-box">
            <FaUserAstronaut size={50} color="#fff" />
          </div>
          <h1>OPERATIVE <span className="highlight">PROFILE</span></h1>
          <p className="p-sub">CLASSIFIED PERSONNEL DATA</p>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="loading">ACCESSING ARCHIVES...</div>
        ) : user ? (
          <div className="p-card">

            <div className="p-row">
              <div className="icon"><FaUserAstronaut /></div>
              <div className="info">
                <label>CODENAME</label>
                <div className="val">{user.name}</div>
              </div>
            </div>

            <div className="p-row">
              <div className="icon"><FaEnvelope /></div>
              <div className="info">
                <label>CONTACT UPLINK</label>
                <div className="val email">{user.email}</div>
              </div>
            </div>

            <div className="p-row">
              <div className="icon"><FaShieldAlt /></div>
              <div className="info">
                <label>SECURITY CLEARANCE</label>
                <div className="val badge">{user.role || "AGENT"}</div>
              </div>
            </div>

            <div className="divider"></div>

            <button className="logout-btn" onClick={handleLogout}>
              <FaSignOutAlt /> TERMINATE SESSION
            </button>

          </div>
        ) : (
          <div className="error">DATA CORRUPTED. RE-LOGIN ADVISED.</div>
        )}

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Teko:wght@400;600&display=swap');

        .profile-page {
          min-height: 100vh;
          background: #050505;
          display: flex;
          align-items: center; // Center vertically like a login/modal page? Or normal page?
          justify-content: center;
          padding: 100px 20px 50px; // Padding top for navbar
          font-family: 'Rajdhani', sans-serif;
          background-image: radial-gradient(circle at 50% 50%, #111 0%, #050505 100%);
        }

        .profile-container {
          width: 100%;
          max-width: 500px;
        }

        .p-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .p-icon-box {
          width: 100px; height: 100px;
          background: #111;
          border: 2px solid #333;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px;
          box-shadow: 0 0 30px rgba(255, 0, 31, 0.2);
        }

        h1 {
          font-family: 'Teko', sans-serif;
          font-size: 48px;
          color: #fff;
          margin: 0;
          line-height: 0.9;
        }

        .highlight { color: #ff001f; }
        .p-sub { color: #666; letter-spacing: 3px; font-size: 14px; margin-top: 5px; }

        .p-card {
          background: rgba(15, 15, 15, 0.6);
          border: 1px solid #222;
          padding: 40px;
          backdrop-filter: blur(10px);
          position: relative;
        }
        
        .p-card::before {
          content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 2px;
          background: linear-gradient(90deg, transparent, #ff001f, transparent);
        }

        .p-row {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 25px;
        }

        .icon {
          width: 50px; height: 50px;
          background: #0a0a0a;
          border: 1px solid #333;
          display: flex; align-items: center; justify-content: center;
          color: #ff001f;
          font-size: 20px;
        }

        .info label {
          display: block;
          font-size: 12px;
          color: #666;
          letter-spacing: 1px;
          margin-bottom: 2px;
        }

        .val {
          font-size: 20px;
          color: #fff;
          font-weight: 700;
          text-transform: uppercase;
        }

        .email { text-transform: none; }
        .badge { color: #ff001f; }

        .divider {
          height: 1px; background: #222; margin: 30px 0;
        }

        .logout-btn {
          width: 100%;
          background: transparent;
          border: 1px solid #ff001f;
          color: #ff001f;
          padding: 15px;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .logout-btn:hover {
          background: #ff001f;
          color: #fff;
          box-shadow: 0 0 20px rgba(255, 0, 31, 0.4);
        }

        .loading, .error {
          text-align: center; color: #888; padding: 40px; border: 1px dashed #333;
        }
      `}</style>
    </div>
  );
};

export default Profile;