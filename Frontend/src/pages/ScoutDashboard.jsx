import React, { useEffect, useState } from "react";
import { FaSearch, FaPlay, FaChevronDown, FaChevronRight, FaHeart, FaPaperPlane, FaCommentAlt, FaEnvelope } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { formatNumber } from "../utils/formatters";
import { useNavigate, NavLink } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://escout-esports-scouting-platform-1.onrender.com";
const GAMES = ["All", "PUBG", "Free Fire", "Fortnite", "COD", "Valorant"];

import LoginGate from "../components/LoginGate";

const ScoutDashboard = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  if (!token) return <LoginGate />;

  const [videos, setVideos] = useState({});
  const [selectedGame, setSelectedGame] = useState("All");

  const [expandedSection, setExpandedSection] = useState("players");

  const [selectedVideo, setSelectedVideo] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12);

  /* ===== Fetch Logic ===== */
  useEffect(() => {
    setLoading(true);
    // Fetch players' videos to scout
    fetch(`${API_BASE_URL}/api/arena/players-videos`)
      .then((res) => res.json())
      .then((data) => {
        setVideos(data || {});
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch videos:", err);
        setVideos({});
        setLoading(false);
      });
  }, []);

  // Reset visible count on filter change
  useEffect(() => {
    setVisibleCount(12);
  }, [selectedGame, search]);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleSelection = (game) => {
    setSelectedGame(game);
  };

  /* ===== Shuffle helper ===== */
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  /* ===== Filter Logic ===== */
  const allVideos = Object.values(videos).flat();
  let displayVideos = selectedGame === "All" ? shuffleArray(allVideos) : videos[selectedGame] || [];

  // Search Filter
  displayVideos = (displayVideos || []).filter((video) =>
    video?.snippet?.title?.toLowerCase().includes(search.toLowerCase()) ||
    video?.snippet?.channelTitle?.toLowerCase().includes(search.toLowerCase())
  );

  /* ===== Loading Screen ===== */
  if (loading) {
    return (
      <div className="loading-screen">
        <style>{`
          .loading-screen {
            height: 100vh; background: #080808; display: flex; align-items: center; justify-content: center;
            color: #ff001f; font-family: 'Teko', sans-serif; font-size: 30px; letter-spacing: 5px;
          }
        `}</style>
        <div className="loader-text">ACCESSING_SCOUT_DATALINK...</div>
      </div>
    );
  }

  return (
    <div className="arena-layout">
      {/* --- CSS STYLES --- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Teko:wght@400;500;700&display=swap');

        :root {
          --bg-black: #080808;
          --red-primary: #ff001f;
          --blue-primary: #00e5ff;
          --text-white: #f0f0f0;
          --text-dim: #666;
          --border-dark: #222;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg-black); }

        .arena-layout {
          display: flex;
          min-height: 100dvh;
          background-color: var(--bg-black);
          color: var(--text-white);
          font-family: 'Rajdhani', sans-serif;
        }

        /* SIDEBAR */
        .sidebar {
          width: 260px;
          background: rgba(10, 10, 10, 0.95);
          border-right: 1px solid var(--border-dark);
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 80px;
          height: calc(100vh - 80px);
          z-index: 50;
        }

        .brand-section { padding: 40px 30px; border-bottom: 1px solid var(--border-dark); }
        .sidebar-title { font-family: 'Teko', sans-serif; font-size: 28px; color: #fff; line-height: 1; }
        .sidebar-title span { color: var(--blue-primary); }

        .menu-container { padding: 20px 0; overflow-y: auto; }

        .group-header {
          width: 100%; padding: 15px 30px; background: transparent; border: none;
          color: #888; font-family: 'Rajdhani', sans-serif; font-size: 13px;
          font-weight: 700; letter-spacing: 2px; cursor: pointer;
          display: flex; justify-content: space-between; align-items: center;
        }
        .group-header:hover, .group-header.active-header { color: #fff; text-shadow: 0 0 10px rgba(0,229,255,0.5); }

        .group-list {
          max-height: 0; overflow: hidden; transition: max-height 0.4s ease;
          background: rgba(255, 255, 255, 0.02);
        }
        .group-list.open { max-height: 500px; }

        .game-btn {
          width: 100%; padding: 12px 30px 12px 45px; background: transparent;
          border: none; color: #aaa; text-align: left; font-family: 'Rajdhani', sans-serif;
          font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s;
          border-left: 2px solid transparent;
        }
        .game-btn:hover { color: #fff; background: rgba(255, 255, 255, 0.05); }
        .game-btn.active {
          color: var(--blue-primary);
          background: linear-gradient(90deg, rgba(0, 229, 255, 0.1), transparent);
          border-left: 2px solid var(--blue-primary);
        }

        /* MAIN CONTENT */
        .content { 
            flex: 1; 
            margin-left: 260px; 
            padding: 15px 60px 50px 60px; 
            position: relative;
            z-index: 1;
        }

        .header {
          display: flex; justify-content: space-between; align-items: flex-end;
          margin-bottom: 50px; border-bottom: 1px solid var(--border-dark); padding-bottom: 20px;
        }
        .page-title h1 {
          font-family: 'Teko', sans-serif; font-size: 60px; text-transform: uppercase;
          line-height: 0.9; margin: 0;
        }
        .page-subtitle { color: var(--text-dim); font-size: 14px; letter-spacing: 2px; text-transform: uppercase; }
        .highlight-text { color: var(--blue-primary); }

        /* SEARCH */
        .search-container { position: relative; width: 300px; z-index: 0; }
        .search-input {
          width: 100%; background: transparent; border: none; border-bottom: 1px solid #333;
          color: #fff; padding: 10px 30px 10px 0; font-family: 'Rajdhani', sans-serif;
          font-size: 16px; outline: none;
        }
        .search-icon { position: absolute; right: 0; top: 10px; color: var(--text-dim); }

        /* VIDEO GRID */
        .video-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 30px; }

        .video-card { background: transparent; cursor: pointer; transition: transform 0.3s ease; border: 1px solid #111; border-radius: 8px; overflow: hidden; }
        .video-card:hover { transform: translateY(-5px); border-color: #333; }

        .thumbnail-box {
          position: relative; aspect-ratio: 16/9; overflow: hidden; background: #111;
        }
        .video-thumb { width: 100%; height: 100%; object-fit: cover; opacity: 0.8; transition: all 0.4s ease; }
        .video-card:hover .video-thumb { opacity: 1; transform: scale(1.05); }

        .overlay-icon {
          position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.3s ease; background: rgba(0,0,0,0.3);
        }
        .play-circle {
          width: 50px; height: 50px; border-radius: 50%; background: var(--blue-primary);
          display: flex; align-items: center; justify-content: center; color: #000;
          box-shadow: 0 0 20px rgba(0, 229, 255, 0.5); transform: scale(0.8); transition: transform 0.3s;
        }
        .video-card:hover .overlay-icon { opacity: 1; }
        .video-card:hover .play-circle { transform: scale(1); }

        .card-meta { padding: 15px; }
        .vid-title {
          font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 8px; line-height: 1.3;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .vid-stats { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1px; }
        .channel-name { color: var(--text-dim); font-weight: 600; text-decoration: none; }
        .video-card:hover .channel-name { color: var(--blue-primary); }
        .channel-name.link-hover:hover { color: #fff; text-decoration: underline; }

        /* LOAD MORE */
        .load-more-container { margin-top: 60px; text-align: center; }
        .load-btn {
          background: transparent; border: 1px solid #333; color: #888; padding: 12px 40px;
          font-family: 'Rajdhani', sans-serif; font-weight: 700; cursor: pointer; letter-spacing: 2px;
          transition: all 0.3s;
        }
        .load-btn:hover { border-color: var(--blue-primary); color: #fff; background: rgba(0, 229, 255, 0.05); }

        /* MODAL */
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.95); z-index: 1000;
          display: flex; align-items: center; justify-content: center;
        }

        .actions-row { display: flex; gap: 15px; margin-top: 10px; padding-top: 10px; border-top: 1px solid #222; }
        .stat-item { display: flex; align-items: center; gap: 5px; color: #aaa; font-size: 12px; font-weight: 600; background:none; border:none; cursor: pointer; }
        .consult-btn { 
          margin-left: auto; background: var(--blue-primary); color: #000; 
          border: none; padding: 4px 12px; border-radius: 4px; font-weight: 700; 
          font-size: 12px; cursor: pointer; transition: 0.3s;
          display: flex; align-items: center; gap: 5px;
        }
        .consult-btn:hover { background: #fff; }

        @media (max-width: 900px) {
          .sidebar { display: none; }
          .content { margin-left: 0; padding: 20px; }
          .header { flex-direction: column; align-items: flex-start; gap: 20px; }
          .search-container { width: 100%; }
        }
      `}</style>

      {/* ===== SIDEBAR ===== */}
      <aside className="sidebar">
        <div className="brand-section">
          <h2 className="sidebar-title">SCOUT <span>COMMAND</span></h2>
        </div>

        <div className="menu-container">
          {/* PLAYERS GROUP */}
          <div>
            <button
              className={`group-header active-header`}
              onClick={() => toggleSection("players")}
            >
              PROSPECT DATABASE
              {expandedSection === "players" ? <FaChevronDown /> : <FaChevronRight />}
            </button>
            <div className={`group-list ${expandedSection === "players" ? "open" : ""}`}>
              {GAMES.map((game) => (
                <button
                  key={`p-${game}`}
                  className={`game-btn ${selectedGame === game ? "active" : ""}`}
                  onClick={() => handleSelection(game)}
                >
                  {game}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* ===== CONTENT ===== */}
      <main className="content">
        <header className="header" style={{ visibility: selectedVideo ? "hidden" : "visible" }}>
          <div className="page-title">
            <div className="page-subtitle">
              PLAYER TALENT
            </div>
            <h1>SCOUTING <span className="highlight-text">RADAR</span></h1>
          </div>

          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="SEARCH PLAYERS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <FaSearch className="search-icon" />
          </div>
        </header>

        <div className="video-grid">
          {displayVideos.length > 0 ? (
            displayVideos.slice(0, visibleCount).map((video) => {
              const id = video?.id?.videoId || video?.id;
              const thumbnailUrl = video?.snippet?.thumbnails?.high?.url || video?.snippet?.thumbnails?.medium?.url || video.thumbnail || "";
              const uploaderName = video?.snippet?.channelTitle || video?.uploaderName || "Unknown Player";

              return (
                <div key={id} className="video-card">
                  <div className="thumbnail-box" onClick={() => setSelectedVideo(video)}>
                    {thumbnailUrl ? (
                      <img src={thumbnailUrl} alt={video?.snippet?.title || video?.title} className="video-thumb" />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Image</div>
                    )}
                    <div className="overlay-icon">
                      <div className="play-circle"><FaPlay size={16} style={{ marginLeft: '2px' }} /></div>
                    </div>
                  </div>

                  <div className="card-meta">
                    <h3 className="vid-title" onClick={() => setSelectedVideo(video)}>{video?.snippet?.title || video?.title}</h3>
                    <div className="vid-stats">
                      <NavLink to={`/player/${video.uploaderId}`} className="channel-name link-hover" onClick={(e) => e.stopPropagation()}>
                        {uploaderName}
                      </NavLink>
                      <span>{formatNumber(Number(video.statistics?.viewCount || video.views || 0))} VIEWS</span>
                    </div>

                    <div className="actions-row">
                      <div className="stat-item">
                        <FaHeart size={12} color="#444" />
                        <span>{formatNumber(video.statistics?.likeCount || video.likesCount || 0)}</span>
                      </div>
                      
                      <button 
                        className="consult-btn" 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/arena-chat", { state: { targetUserId: video.uploaderId } });
                        }}
                      >
                        <FaEnvelope /> CONSULT
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#666' }}>
              NO PROSPECTS FOUND.
            </div>
          )}
        </div>

        {visibleCount < displayVideos.length && (
          <div className="load-more-container">
            <button className="load-btn" onClick={() => setVisibleCount((v) => v + 9)}>
              LOAD MORE PROSPECTS
            </button>
          </div>
        )}
      </main>

      {/* ===== MODAL ===== */}
      {selectedVideo && (
        <ScoutVideoModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
          navigate={navigate}
        />
      )}
    </div>
  );
};

/* =========================================
   SUB-COMPONENT: SCOUT VIDEO MODAL
   ========================================= */
const ScoutVideoModal = ({ video, onClose, navigate }) => {
  const isPlayerVideo = video.isPlayerVideo || !!video.videoUrl;
  const videoId = video?.id?.videoId || video?.id;
  const uploaderName = video?.snippet?.channelTitle || video?.uploaderName || "Unknown Player";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-box split-view`} onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}><IoMdClose /></button>

        <div className="modal-split">
          <div className="video-section">
            {isPlayerVideo && video.videoUrl ? (
              <video
                width="100%"
                height="100%"
                controls
                autoPlay
                src={video.videoUrl}
              />
            ) : (
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                title="Video Player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>

          <div className="interaction-section">
            <div className="int-header">
              <h3>PLAYER PROFILE</h3>
            </div>
            
            <div className="profile-details">
                <div style={{ padding: "20px", color: "#ccc" }}>
                    <div style={{ marginBottom: "20px" }}>
                        <h2 style={{ color: "#fff", fontFamily: "'Rajdhani'", fontSize: "28px" }}>{uploaderName}</h2>
                        <span style={{ color: "var(--blue-primary)", fontSize: "14px", textTransform: "uppercase", letterSpacing: "1px" }}>Prospect / Uploaded Video</span>
                    </div>

                    <div style={{ background: "#111", padding: "15px", borderRadius: "6px", border: "1px solid #222", marginBottom: "20px" }}>
                        <h4 style={{ color: "#888", marginBottom: "5px", fontSize: "12px", textTransform: "uppercase" }}>Video Title</h4>
                        <p style={{ color: "#fff", fontWeight: "600", fontSize: "14px" }}>{video?.snippet?.title || video?.title}</p>
                    </div>

                    <div style={{ display: "flex", gap: "10px", marginBottom: "30px" }}>
                        <div style={{ flex: 1, background: "#111", padding: "10px", borderRadius: "6px", border: "1px solid #222", textAlign: "center" }}>
                            <div style={{ fontSize: "11px", color: "#888" }}>VIEWS</div>
                            <div style={{ fontSize: "18px", color: "#fff", fontWeight: "700" }}>{formatNumber(Number(video.statistics?.viewCount || video.views || 0))}</div>
                        </div>
                        <div style={{ flex: 1, background: "#111", padding: "10px", borderRadius: "6px", border: "1px solid #222", textAlign: "center" }}>
                            <div style={{ fontSize: "11px", color: "#888" }}>LIKES</div>
                            <div style={{ fontSize: "18px", color: "#fff", fontWeight: "700" }}>{formatNumber(video.statistics?.likeCount || video.likesCount || 0)}</div>
                        </div>
                    </div>

                    <button 
                        style={{ width: "100%", padding: "15px", background: "var(--blue-primary)", color: "#000", border: "none", borderRadius: "8px", fontWeight: "bold", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", transition: "0.3s" }}
                        onClick={() => navigate("/arena-chat", { state: { targetUserId: video.uploaderId } })}
                    >
                        <FaEnvelope /> INITIATE CONSULTATION
                    </button>
                    <p style={{ textAlign: "center", fontSize: "12px", color: "#666", marginTop: "10px" }}>
                        Connect with this player in the Arena Chat to discuss recruitment.
                    </p>
                </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .modal-box { width: 80%; max-width: 1100px; aspect-ratio: 16/9; background: #000; position: relative; box-shadow: 0 0 50px rgba(0, 229, 255, 0.1); border: 1px solid #222; overflow: hidden; display: flex; flex-direction: column; }
        .modal-box.split-view { aspect-ratio: auto; height: 85vh; max-width: 1200px; width: 90%; }
        
        .modal-split { display: flex; width: 100%; height: 100%; }
        .video-section { flex: 3; background: #000; display: flex; align-items: center; justify-content: center; width: 100%; }
        
        .interaction-section { flex: 1; border-left: 1px solid #222; display: flex; flex-direction: column; background: #0a0a0a; min-width: 350px; }
        .int-header { padding: 15px; border-bottom: 1px solid #222; display: flex; justify-content: space-between; align-items: center; font-family: 'Teko'; font-size: 20px; color: #fff; }
        .profile-details { flex: 1; overflow-y: auto; }

        .close-btn { position: absolute; top: 15px; left: 15px; z-index: 10; background: rgba(0,0,0,0.6); color: #fff; font-size: 24px; cursor: pointer; border-radius: 50%; padding: 5px; border:none; transition: opacity 0.3s; opacity: 0; }
        .modal-box:hover .close-btn { opacity: 1; } 

        @media (max-width: 900px) {
          .modal-split { flex-direction: column; }
          .modal-box.split-view { height: 100%; width: 100%; }
          .interaction-section { height: auto; }
          .video-section { height: 50vh; }
        }
      `}</style>
    </div>
  );
};

export default ScoutDashboard;
