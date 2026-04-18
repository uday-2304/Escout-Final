import React, { useEffect, useState } from "react";
import {
  FaPlay, FaGamepad, FaHeart, FaCommentAlt,
  FaSearch, FaBell, FaChevronDown, FaPlus, FaUserAstronaut, FaPaperPlane, FaTrash
} from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { NavLink, useNavigate } from "react-router-dom";
import { formatNumber } from "../utils/formatters";

import LoginGate from "../components/LoginGate";
import api from "../api/Axios";
import { useToast } from "../components/Toast/ToastContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const Dashboard = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);
  const [selectedGame, setSelectedGame] = useState("All");

  const navigate = useNavigate();
  // Check auth immediately
  const token = localStorage.getItem("token");
  const { showToast } = useToast();
  if (!token) return <LoginGate />;

  const currentUserId = String(localStorage.getItem("userId"));
  const games = ["All", "PUBG", "Free Fire", "Valorant", "COD", "Fortnite"];

  const [userName, setUserName] = useState("OPERATIVE");

  /* ================= FETCH VIDEOS & USER ================= */
  useEffect(() => {
    // Fetch User
    api
      .get("/api/v1/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data?.success) setUserName(res.data.data.name);
      })
      .catch((err) => console.error(err));

    const fetchVideos = async () => {
      // Token availability is already checked by LoginGate
      if (!token) return;

      try {
        const res = await api.get("/api/dashboard/videos", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setVideos(res.data.videos || []);
      } catch (err) {
        if (err.response?.status === 401) {
          showToast("Session expired", { type: "warning" });
          navigate("/login");
          return;
        }
        console.error(err);
        showToast("Unable to load videos", { type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [navigate, token]);


  /* ================= DELETE VIDEO ================= */
  const deleteVideo = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this video?")) return;

    try {
      const res = await api.delete(`/api/dashboard/videos/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (res.status === 204 || res.status === 200) {
        setVideos((prev) => prev.filter((v) => v._id !== id));
        if (activeVideo?._id === id) setActiveVideo(null);
        showToast("Video deleted", { type: "success" });
      } else {
        showToast("Failed to delete video", { type: "error" });
      }
    } catch (err) {
      console.error(err);
      showToast("Error deleting video", { type: "error" });
    }
  };

  /* ================= BODY SCROLL LOCK ================= */
  useEffect(() => {
    if (activeVideo) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [activeVideo]);

  const filteredVideos = selectedGame === "All" ? videos : videos.filter((v) => v.game === selectedGame);

  return (
    <div className="dashboard-layout">
      {/* CSS Styles Block */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Teko:wght@400;500;600;700&display=swap');
        :root {
          --bg-dark: #080808;
          --red-primary: #ff001f;
          --text-white: #f0f0f0;
          --text-dim: #666;
          --border-dark: #222;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; } 
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
        
        body { background: var(--bg-dark); color: var(--text-white); font-family: 'Rajdhani', sans-serif; }
        .dashboard-layout { display: flex; min-height: 100dvh; background-color: var(--bg-dark); overflow-x: hidden; }
        
        /* SIDEBAR */
        .sidebar { 
          width: 260px; padding: 40px 0; border-right: 1px solid var(--border-dark); 
          display: flex; flex-direction: column; position: fixed; height: calc(100vh - 80px); 
          top: 80px; /* Offset for Navbar */
          background: rgba(10, 10, 10, 0.95); z-index: 50; 
        }
        .brand { padding: 0 30px 40px 30px; border-bottom: 1px solid var(--border-dark); margin-bottom: 20px; }
        .brand-text { font-family: 'Teko', sans-serif; font-size: 36px; font-weight: 700; color: #fff; line-height: 1; letter-spacing: 1px; }
        .brand-text span { color: var(--red-primary); }
        .nav-header { padding: 0 30px; font-size: 11px; font-weight: 700; color: var(--text-dim); margin-bottom: 20px; letter-spacing: 2px; opacity: 0.7; }
        .filter-btn { 
          width: 100%; padding: 14px 30px; background: transparent; border: none; 
          display: flex; align-items: center; gap: 15px; color: #777; 
          font-family: 'Rajdhani', sans-serif; font-size: 16px; font-weight: 600; 
          cursor: pointer; transition: all 0.3s ease; border-left: 3px solid transparent; 
        }
        .filter-btn:hover { color: #fff; background: rgba(255, 255, 255, 0.05); padding-left: 35px; }
        .filter-btn.active { 
          color: var(--red-primary); background: linear-gradient(90deg, rgba(255, 0, 31, 0.08), transparent); 
          border-left: 3px solid var(--red-primary);
        }
        .sidebar-footer { margin-top: auto; padding: 30px; }
        .rank-widget { 
          padding: 20px; background: #111; border: 1px solid var(--border-dark); 
          display: flex; justify-content: space-between; align-items: center; 
          font-size: 14px; border-radius: 4px; 
        }
        .rank-val { color: var(--red-primary); font-weight: 700; letter-spacing: 1px; }

        /* MAIN CONTENT */
        /* CHANGED: Reduced top padding and added z-index constraints */
        .main-content { 
          flex: 1; margin-left: 260px; 
          padding: 15px 60px 50px 60px; 
          margin-top: 80px; 
          position: relative;
          z-index: 1;
        }
        /* CHANGED: Reduced margin-bottom to pull the hero text up tighter */
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        
        .search-wrapper { 
          display: flex; align-items: center; gap: 15px; background: transparent;
          border-bottom: 1px solid #333; padding: 10px 0; width: 350px; 
          transition: all 0.3s; 
          position: relative; 
          z-index: 0; /* Ensures navbar dropdown falls over it */
        }
        .search-wrapper:focus-within { border-color: var(--red-primary); }
        .search-input { background: transparent; border: none; color: #fff; width: 100%; outline: none; font-family: 'Rajdhani', sans-serif; font-size: 16px; font-weight: 500; }
        .header-actions { display: flex; align-items: center; gap: 30px; }
        .upload-btn { 
          display: flex; align-items: center; gap: 10px; background: transparent; 
          border: 1px solid var(--red-primary); color: var(--red-primary); text-decoration: none; 
          padding: 10px 25px; font-size: 14px; font-weight: 700; letter-spacing: 1px; 
          transition: all 0.3s; 
        }
        .upload-btn:hover { background: var(--red-primary); color: #fff; transform: translateY(-2px); }
        
        /* HERO */
        .hero { margin-bottom: 40px; }
        /* CHANGED: Font size reduced from 72px to 50px */
        .hero-title { font-family: 'Teko', sans-serif; font-size: 50px; font-weight: 600; color: #fff; line-height: 0.85; margin-bottom: 10px; text-transform: uppercase; }
        .hero-title span { color: var(--red-primary); }
        .hero-sub { color: var(--text-dim); letter-spacing: 4px; text-transform: uppercase; font-size: 14px; font-weight: 600; margin-left: 5px; }

        /* GRID & CARDS */
        .section-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; border-bottom: 1px solid var(--border-dark); padding-bottom: 15px; }
        .section-title { font-size: 24px; font-weight: 700; letter-spacing: 1px; color: #fff; display: flex; align-items: center; gap: 10px; }
        .count { font-size: 13px; color: #555; font-weight: 600; letter-spacing: 1px; }

        .video-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 30px; }
        
        .video-card { background: transparent; cursor: pointer; transition: transform 0.3s ease; }
        .video-card:hover { transform: translateY(-5px); }

        .thumbnail-box {
          position: relative; aspect-ratio: 16/9; border-radius: 4px; overflow: hidden; background: #111;
        }
        .video-thumb { width: 100%; height: 100%; object-fit: cover; opacity: 0.9; transition: all 0.4s ease; }
        .video-card:hover .video-thumb { opacity: 1; transform: scale(1.05); }

        .overlay-icon {
          position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.3s ease; background: rgba(0,0,0,0.3);
        }
        .play-circle {
          width: 50px; height: 50px; border-radius: 50%; background: var(--red-primary);
          display: flex; align-items: center; justify-content: center; color: white;
          box-shadow: 0 0 20px rgba(255, 0, 31, 0.5); transform: scale(0.8); transition: transform 0.3s;
        }
        .video-card:hover .overlay-icon { opacity: 1; }
        .video-card:hover .play-circle { transform: scale(1); }
        
        .card-meta { padding-top: 15px; }
        .vid-title {
          font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 8px; line-height: 1.3;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .vid-stats { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1px; }
        .channel-name { color: var(--text-dim); }
        .video-card:hover .channel-name { color: var(--red-primary); }
        
        .actions { display: flex; gap: 15px; margin-top: 10px; border-top: 1px solid #222; padding-top: 10px; justify-content: space-between; align-items: center; }
        .action-btn { display: flex; align-items: center; gap: 6px; background: transparent; border: none; cursor: pointer; color: #666; transition: all 0.3s; font-family: 'Rajdhani', sans-serif; font-weight: 600; font-size: 13px; }
        .action-btn:hover { color: #fff; }
        .stat-item { display: flex; align-items: center; gap: 5px; color: #666; font-size: 12px; font-weight: 600; }
        .trash-icon:hover { color: var(--red-primary); }

        /* MODAL & RESPONSIVE */
        .modal-overlay { position: fixed; inset: 0; background: #000; display: flex; align-items: center; justify-content: center; z-index: 100; animation: fadeIn 0.3s; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        
        @media (max-width: 1100px) { .sidebar { display: none; } .main-content { margin-left: 0; padding: 30px; } .hero-title { font-size: 48px; } }
      `}</style>

      {/* ===== SIDEBAR ===== */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-text">ARCADER <span>DASH</span></div>
        </div>

        <nav>
          <p className="nav-header">DATABASE FILTER</p>
          <div className="filter-group">
            {games.map((g) => (
              <button
                key={g}
                className={`filter-btn ${selectedGame === g ? "active" : ""}`}
                onClick={() => setSelectedGame(g)}
              >
                <FaGamepad size={14} />
                <span>{g.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="rank-widget">
            <span style={{ color: '#666' }}>RANKING</span>
            <span className="rank-val">DIAMOND II</span>
          </div>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="main-content">

        {/* Header - Always visible, Modal covers it */}
        <header className="header">
          <div className="search-wrapper">
            <FaSearch color="#444" size={14} />
            <input type="text" placeholder="SEARCH CLIPS..." className="search-input" />
          </div>

          <div className="header-actions">
            <NavLink to="/add-video" className="upload-btn">
              <FaPlus size={12} /> UPLOAD CLIP
            </NavLink>
          </div>
        </header>

        <section className="hero">
          <h1 className="hero-title">GAMING <span>HIGHLIGHTS</span></h1>
          <p className="hero-sub">Your personal command center for top plays.</p>
        </section>

        <section>
          <div className="section-header">
            <h2 className="section-title">MY UPLOADS</h2>
            <span className="count">[{filteredVideos.length}] RECORDS FOUND</span>
          </div>

          {loading ? (
            <p style={{ color: '#ff001f', fontSize: '24px', fontFamily: 'Teko' }}>LOADING SYSTEM...</p>
          ) : (
            <div className="video-grid">
              {filteredVideos.map((video) => {
                // CHANGED: Added logic to handle full URLs vs relative paths safely
                const thumbUrl = video.thumbnail 
                  ? (video.thumbnail.startsWith("http") 
                      ? video.thumbnail 
                      : `${API_BASE_URL}${video.thumbnail.startsWith('/') ? '' : '/'}${video.thumbnail}`)
                  : "";

                return (
                  <div key={video._id} className="video-card" onClick={() => setActiveVideo(video)}>
                    {/* Thumbnail */}
                    <div className="thumbnail-box">
                      {thumbUrl ? (
                        <img 
                          src={thumbUrl} 
                          alt={video.title} 
                          className="video-thumb" 
                          onError={(e) => { 
                            e.target.onerror = null; 
                            e.target.style.display = 'none'; 
                          }} 
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Image</div>
                      )}
                      <div className="overlay-icon">
                        <div className="play-circle">
                          <FaPlay size={16} style={{ marginLeft: '2px' }} />
                        </div>
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="card-meta">
                      <h3 className="vid-title">{video.title}</h3>
                      <div className="vid-stats">
                        <span className="channel-name">{userName}</span>
                        <span>{formatNumber(video.views || 0)} VIEWS</span>
                      </div>

                      <div className="actions">
                        <div style={{ display: 'flex', gap: '15px' }}>
                          <span className="stat-item">
                            <FaHeart size={12} color={video.likes?.includes(currentUserId) ? "#ff001f" : "#444"} /> 
                            <span style={{ color: video.likes?.includes(currentUserId) ? "#ff001f" : "#666" }}>{formatNumber(video.likes?.length || 0)}</span>
                          </span>
                          <span className="stat-item"><FaCommentAlt size={12} color="#444" /> {formatNumber(video.comments?.length || 0)}</span>
                        </div>
                        <button className="action-btn" onClick={(e) => deleteVideo(video._id, e)} title="Delete Video">
                          <FaTrash color="#444" size={12} className="trash-icon" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {
        activeVideo && (
          <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />
        )
      }
    </div >
  );
};

/* =========================================
   SUB-COMPONENT: DASHBOARD VIDEO MODAL
   ========================================= */
const VideoModal = ({ video, onClose }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  // View Increment Logic
  useEffect(() => {
    if (!video?._id) return;

    const sessionKey = `viewed_${video._id}`;
    const hasViewed = sessionStorage.getItem(sessionKey);

    if (!hasViewed) {
      fetch(`${API_BASE_URL}/api/dashboard/videos/${video._id}/view`, {
        method: "PUT"
      }).catch(err => console.error("View increment failed", err));

      sessionStorage.setItem(sessionKey, "true");
    }

    // Fetch comments
    fetch(`${API_BASE_URL}/api/arena/${video._id}/comments`)
      .then(res => res.json())
      .then(data => setComments(data))
      .catch(err => console.error(err));
  }, [video]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const tempComment = {
      _id: Date.now(),
      text: newComment,
      userId: { name: "Me" },
      createdAt: new Date().toISOString()
    };

    setComments([tempComment, ...comments]);
    setNewComment("");

    try {
      await fetch(`${API_BASE_URL}/api/arena/${video._id}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ text: tempComment.text })
      });
    } catch (err) { console.error(err); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box split-view" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}><IoMdClose /></button>

        <div className="modal-split">
          <div className="video-section">
            <video
              width="100%"
              height="100%"
              controls
              autoPlay
              src={video.videoUrl?.startsWith('http') ? video.videoUrl : `${API_BASE_URL}${video.videoUrl?.startsWith('/') ? '' : '/'}${video.videoUrl}`}
            />
          </div>

          <div className="interaction-section">
            <div className="int-header">
              <h3>COMMENTS</h3>
            </div>

            <div className="comments-list">
              {comments.map(c => (
                <div key={c._id} className="comment-item">
                  <strong>{c.userId?.name || c.userId?.userName || "User"}:</strong> {c.text}
                </div>
              ))}
              {comments.length === 0 && <p style={{ color: '#444', padding: 10 }}>No comments yet.</p>}
            </div>

            <form className="comment-input-box" onSubmit={handlePostComment}>
              <input
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Type a comment..."
              />
              <button type="submit"><FaPaperPlane /></button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        .modal-box { width: 90%; height: 85vh; max-width: 1400px; background: #000; position: relative; box-shadow: 0 0 50px rgba(255, 0, 31, 0.1); border: 1px solid #222; overflow: hidden; display: flex; flex-direction: column; }
        
        .modal-split { display: flex; width: 100%; height: 100%; }
        .video-section { flex: 3; background: #000; display: flex; align-items: center; justify-content: center; width: 100%; }
        
        .interaction-section { flex: 1; border-left: 1px solid #222; display: flex; flex-direction: column; background: #0a0a0a; min-width: 320px; }
        .int-header { padding: 15px; border-bottom: 1px solid #222; display: flex; justify-content: space-between; align-items: center; font-family: 'Teko'; font-size: 20px; color: #fff; }
        .comments-list { flex: 1; overflow-y: auto; padding: 15px; font-size: 14px; color: #ccc; }
        .comment-item { margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #1a1a1a; word-break: break-word; }
        .comment-item strong { color: #ff001f; margin-right: 5px; }
        .comment-input-box { padding: 15px; border-top: 1px solid #222; display: flex; gap: 10px; background: #080808; }
        .comment-input-box input { flex: 1; background: #111; border: 1px solid #333; color: #fff; padding: 10px; outline: none; border-radius: 4px; }
        .comment-input-box button { background: #ff001f; border: none; color: #fff; padding: 0 15px; cursor: pointer; border-radius: 4px; font-weight: bold; }

      .close-btn { position: absolute; top: 15px; left: 0px; z-index: 10; background: rgba(0,0,0,0.6); color: #fff; font-size: 24px; cursor: pointer;  padding: 5px; border:none; transition: opacity 0.3s; opacity: 0; }
             .modal-box:hover .close-btn { opacity: 1; } 


        @media (max-width: 900px) {
          .modal-split { flex-direction: column; }
          .interaction-section { height: 40%; }
          .video-section { height: 60%; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;