import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaPlay, FaEnvelope, FaInstagram, FaPhoneAlt, FaEnvelopeOpenText } from "react-icons/fa";
import { formatNumber } from "../utils/formatters";
import LoginGate from "../components/LoginGate";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://escout-esports-scouting-platform-1.onrender.com";

const PlayerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  if (!token) return <LoginGate />;

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/arena/player/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Could not fetch player profile");
        return res.json();
      })
      .then(data => {
        setProfileData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="loading-screen">ACCESSING_PLAYER_DATALINK...</div>;
  if (error) return <div className="error-screen">{error}</div>;
  if (!profileData || !profileData.user) return <div className="error-screen">Player Not Found</div>;

  const { user, videos } = profileData;

  const handleConsult = () => {
    navigate("/arena-chat", { state: { targetUserId: user._id } });
  };

  return (
    <div className="profile-page">
      {/* ======= STYLES ======= */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Teko:wght@400;500;700&display=swap');

        .profile-page {
          min-height: 100vh;
          background-color: #050505;
          color: #fff;
          font-family: 'Rajdhani', sans-serif;
          padding-bottom: 50px;
        }

        .loading-screen, .error-screen {
          height: 100vh; background: #050505; display: flex; align-items: center; justify-content: center;
          color: #ff001f; font-family: 'Teko', sans-serif; font-size: 30px; letter-spacing: 5px; text-transform: uppercase;
        }

        /* BANNER & HEADER */
        .banner {
          width: 100%; height: 260px;
          background: linear-gradient(to bottom, #111, #080808);
          border-bottom: 1px solid #222;
          position: relative;
        }
        .banner img { width: 100%; height: 100%; object-fit: cover; opacity: 0.5; }

        .profile-header {
          max-width: 1200px; margin: 0 auto;
          position: relative; top: -80px;
          display: flex; gap: 40px; padding: 0 40px;
          align-items: flex-end;
        }

        .avatar-container {
          width: 160px; height: 160px; border-radius: 50%;
          border: 4px solid #050505; background: #111;
          display: flex; align-items: center; justify-content: center;
          font-size: 60px; font-weight: bold; color: #ff001f;
          overflow: hidden; flex-shrink: 0; box-shadow: 0 0 30px rgba(0,0,0,0.8);
        }
        .avatar-container img { width: 100%; height: 100%; object-fit: cover; }

        .header-info { flex: 1; padding-bottom: 10px; }
        .p-name { font-family: 'Teko', sans-serif; font-size: 55px; line-height: 1; letter-spacing: 2px; text-transform: uppercase; }
        .p-role { font-size: 16px; color: #00e5ff; letter-spacing: 2px; text-transform: uppercase; font-weight: 600; margin-bottom: 15px;}
        
        .contact-pills { display: flex; gap: 15px; flex-wrap: wrap; margin-bottom: 20px;}
        .pill { display: flex; align-items: center; gap: 8px; background: #111; padding: 6px 15px; border-radius: 20px; font-size: 13px; color: #aaa; border: 1px solid #222; }
        .pill svg { color: #ff001f; }

        .action-btns {
          padding-bottom: 20px;
        }
        .msg-btn {
          background: #00e5ff; color: #000; border: none; padding: 12px 30px; font-family: 'Rajdhani';
          font-weight: 700; font-size: 16px; letter-spacing: 1px; cursor: pointer; border-radius: 4px;
          transition: 0.3s; display: flex; align-items: center; gap: 10px;
        }
        .msg-btn:hover { background: #fff; box-shadow: 0 0 20px rgba(0, 229, 255, 0.4); transform: translateY(-2px); }

        /* VIDEOS SECTION */
        .content-container { max-width: 1200px; margin: 0 auto; padding: 20px 40px; }
        .section-title { font-family: 'Teko'; font-size: 32px; letter-spacing: 2px; margin-bottom: 30px; border-bottom: 1px solid #222; padding-bottom: 10px; }
        .section-title span { color: #ff001f; }

        .video-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 30px; }

        .video-card { background: transparent; cursor: pointer; transition: transform 0.3s ease; border: 1px solid #111; border-radius: 6px; overflow: hidden; }
        .video-card:hover { transform: translateY(-5px); border-color: #333; }

        .thumbnail-box { position: relative; aspect-ratio: 16/9; overflow: hidden; background: #111; }
        .video-thumb { width: 100%; height: 100%; object-fit: cover; opacity: 0.8; transition: all 0.4s ease; }
        .video-card:hover .video-thumb { opacity: 1; transform: scale(1.05); }

        .overlay-icon { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s ease; background: rgba(0,0,0,0.3); }
        .play-circle { width: 45px; height: 45px; border-radius: 50%; background: #ff001f; display: flex; align-items: center; justify-content: center; color: white; transform: scale(0.8); transition: transform 0.3s; }
        .video-card:hover .overlay-icon { opacity: 1; }
        .video-card:hover .play-circle { transform: scale(1); }

        .card-meta { padding: 15px; }
        .vid-title { font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 8px; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .vid-stats { display: flex; justify-content: space-between; font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 1px; }

        @media (max-width: 768px) {
          .profile-header { flex-direction: column; align-items: center; text-align: center; top: -60px; padding: 0 20px; gap: 20px; }
          .contact-pills { justify-content: center; }
          .action-btns { width: 100%; display: flex; justify-content: center; }
        }
      `}</style>

      {/* BANNER */}
      <div className="banner">
        {user.coverImage && <img src={user.coverImage} alt="Cover" />}
      </div>

      {/* HEADER INFO */}
      <div className="profile-header">
        <div className="avatar-container">
          {(user.userName || user.name || "U").charAt(0).toUpperCase()}
        </div>
        
        <div className="header-info">
          <div className="p-name">{user.userName || user.name || "Unknown"}</div>
          <div className="p-role">ESPORTS {user.role || "PLAYER"}</div>
          
          <div className="contact-pills">
            <div className="pill"><FaEnvelopeOpenText /> {user.email}</div>
            {user.phoneNumber && <div className="pill"><FaPhoneAlt /> {user.phoneNumber}</div>}
            {user.instaHandle && <div className="pill"><FaInstagram /> @{user.instaHandle}</div>}
          </div>
        </div>

        <div className="action-btns">
          <button className="msg-btn" onClick={handleConsult}>
            <FaEnvelope /> DIRECT MESSAGE
          </button>
        </div>
      </div>

      {/* MEDIA ARCHIVE */}
      <div className="content-container">
        <h3 className="section-title">PLAYER <span>ARCHIVE</span></h3>
        
        <div className="video-grid">
          {videos.length > 0 ? (
            videos.map(v => (
              <div key={v.id.videoId} className="video-card">
                <div className="thumbnail-box">
                  <img src={v.snippet.thumbnails.high.url} alt={v.snippet.title} className="video-thumb" />
                  <div className="overlay-icon">
                    <div className="play-circle"><FaPlay size={14} style={{ marginLeft: '2px' }} /></div>
                  </div>
                </div>
                <div className="card-meta">
                  <h3 className="vid-title">{v.snippet.title}</h3>
                  <div className="vid-stats">
                    <span style={{ color: "#00e5ff", fontWeight: "600" }}>{v.game || "General"}</span>
                    <span>{formatNumber(v.statistics.viewCount)} VIEWS</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ color: "#666", padding: "40px 0", textAlign: "center", gridColumn: "1/-1" }}>
              NO INTEL FOUND.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerProfile;
