import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserAstronaut, FaSignOutAlt, FaShieldAlt, FaEnvelope, FaGamepad, FaCamera } from 'react-icons/fa';
import LoginGate from '../components/LoginGate';
import api from '../api/Axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    const loadUserData = async () => {
      try {
        // 1. Instant load from localStorage if available
        const localInfo = localStorage.getItem("userInfo");
        if (localInfo) {
          const parsed = JSON.parse(localInfo);
          if (parsed.user) setUser(parsed.user);
        }

        // 2. Fetch fresh data from backend
        const res = await api.get("/api/auth/profile");
        if (res.data?.data) {
          setUser(res.data.data);
          // Update localStorage with fresh data
          localStorage.setItem("userInfo", JSON.stringify({ user: res.data.data }));
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [token]);

  if (!token) return <LoginGate />;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  return (
    <div className="profile-page">
      <div className="profile-container">

        {loading && !user ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>SYNCING PROFILES...</p>
          </div>
        ) : user ? (
          <>
            {/* PROFILE HEADER & AVATAR */}
            <div className="profile-header-card">
              <div className="cover-photo"></div>
              
              <div className="avatar-section">
                <div className="avatar-wrapper">
                  {user.coverImage ? (
                    <img src={user.coverImage} alt="Profile" className="avatar-img" />
                  ) : (
                    <div className="avatar-placeholder">
                      <FaUserAstronaut size={40} color="#fff" />
                    </div>
                  )}
                  <div className="avatar-glow"></div>
                </div>
                
                <div className="user-titles">
                  <h1>{user.userName || user.name || "Unknown Player"}</h1>
                  <span className={`role-badge ${user.role === 'scout' ? 'scout' : 'player'}`}>
                    {user.role === 'scout' ? 'Verified Scout' : 'Esports Athlete'}
                  </span>
                </div>
              </div>
            </div>

            {/* PROFILE DETAILS CARD */}
            <div className="profile-details-card">
              <div className="details-header">
                <h3><FaGamepad /> Account Information</h3>
              </div>
              
              <div className="details-grid">
                <div className="detail-item">
                  <div className="detail-icon"><FaUserAstronaut /></div>
                  <div className="detail-content">
                    <label>Username</label>
                    <p>{user.userName || user.name || "N/A"}</p>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-icon"><FaEnvelope /></div>
                  <div className="detail-content">
                    <label>Email Address</label>
                    <p className="lowercase">{user.email}</p>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-icon"><FaShieldAlt /></div>
                  <div className="detail-content">
                    <label>Account Type</label>
                    <p className="uppercase">{user.role || "Player"}</p>
                  </div>
                </div>
              </div>

              <div className="card-actions">
                <button className="logout-btn" onClick={handleLogout}>
                  <FaSignOutAlt /> Sign Out
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="error-state">
            <FaShieldAlt size={40} />
            <p>DATA CORRUPTED. PLEASE RE-LOGIN.</p>
            <button className="logout-btn" onClick={handleLogout}>Return to Login</button>
          </div>
        )}

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Orbitron:wght@500;700&family=Inter:wght@400;500;600&display=swap');

        .profile-page {
          min-height: 100vh;
          background-color: #050505;
          background-image: 
            radial-gradient(circle at 15% 50%, rgba(255, 0, 31, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 85% 30%, rgba(200, 0, 0, 0.05) 0%, transparent 50%);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 120px 20px 60px;
          font-family: 'Inter', sans-serif;
          color: #fff;
        }

        .profile-container {
          width: 100%;
          max-width: 600px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          animation: fadeUp 0.6s ease-out forwards;
        }

        /* --- Header Card --- */
        .profile-header-card {
          background: rgba(15, 15, 15, 0.6);
          border: 1px solid #222;
          border-radius: 20px;
          overflow: hidden;
          position: relative;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }

        .cover-photo {
          height: 120px;
          background: linear-gradient(135deg, #1a0000 0%, #ff001f 100%);
          position: relative;
        }
        
        .cover-photo::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; width: 100%; height: 50%;
          background: linear-gradient(to top, rgba(15,15,15,0.9), transparent);
        }

        .avatar-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 20px 30px;
          margin-top: -60px;
          position: relative;
          z-index: 2;
        }

        .avatar-wrapper {
          position: relative;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: #000;
          padding: 4px;
          border: 2px solid #222;
          margin-bottom: 15px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.8);
        }

        .avatar-img, .avatar-placeholder {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          background: #111;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .avatar-glow {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          border-radius: 50%;
          box-shadow: 0 0 20px rgba(255, 0, 31, 0.3);
          pointer-events: none;
        }

        .user-titles {
          text-align: center;
        }

        .user-titles h1 {
          font-family: 'Rajdhani', sans-serif;
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 8px 0;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .role-badge {
          display: inline-block;
          padding: 6px 16px;
          border-radius: 30px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .role-badge.scout {
          background: rgba(255, 0, 31, 0.1);
          color: #ff001f;
          border: 1px solid rgba(255, 0, 31, 0.3);
        }

        .role-badge.player {
          background: rgba(0, 150, 255, 0.1);
          color: #0096ff;
          border: 1px solid rgba(0, 150, 255, 0.3);
        }


        /* --- Details Card --- */
        .profile-details-card {
          background: rgba(15, 15, 15, 0.6);
          border: 1px solid #222;
          border-radius: 20px;
          padding: 30px;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .details-header h3 {
          font-family: 'Rajdhani', sans-serif;
          font-size: 20px;
          color: #aaa;
          margin: 0 0 25px 0;
          display: flex;
          align-items: center;
          gap: 10px;
          letter-spacing: 1px;
          border-bottom: 1px solid #222;
          padding-bottom: 15px;
        }

        .details-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 16px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid #1a1a1a;
          padding: 16px 20px;
          border-radius: 12px;
          transition: border-color 0.3s;
        }

        .detail-item:hover {
          border-color: #333;
        }

        .detail-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: rgba(255, 0, 31, 0.05);
          color: #ff001f;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }

        .detail-content label {
          display: block;
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 4px;
        }

        .detail-content p {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
          color: #eee;
        }

        .detail-content p.lowercase {
          text-transform: none;
        }
        .detail-content p.uppercase {
          text-transform: uppercase;
        }

        .card-actions {
          margin-top: 35px;
          padding-top: 25px;
          border-top: 1px solid #222;
        }

        .logout-btn {
          width: 100%;
          background: transparent;
          border: 1px solid #ff001f;
          color: #ff001f;
          padding: 16px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          font-size: 18px;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .logout-btn:hover {
          background: #ff001f;
          color: #fff;
          box-shadow: 0 8px 20px rgba(255, 0, 31, 0.3);
          transform: translateY(-2px);
        }

        /* --- States --- */
        .loading-state, .error-state {
          background: rgba(15, 15, 15, 0.6);
          border: 1px solid #222;
          border-radius: 20px;
          padding: 60px 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 0, 31, 0.2);
          border-top-color: #ff001f;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .loading-state p, .error-state p {
          color: #888;
          letter-spacing: 2px;
          font-family: 'Rajdhani', sans-serif;
          font-weight: 600;
        }

        .error-state {
          color: #ff001f;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Profile;