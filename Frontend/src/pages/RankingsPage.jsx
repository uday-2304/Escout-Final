import React, { useState, useEffect } from "react";
import { FaSearch, FaTrophy, FaUserAstronaut, FaGlobe, FaCommentDots } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { formatNumber } from "../utils/formatters";
import api from "../api/Axios";

// --- MOCK DATA ---
const INITIAL_DATA = {
  BGMI: [
    { rank: 1, alias: "UNOLOVE", realName: "Tejdeep", team: "Nobita", winnings: "$993,447", img: "" },
    { rank: 2, alias: "Jonathan", realName: "Jonathan Jude Amaral", team: "GodLike", winnings: "$83,447", img: "" },
    { rank: 3, alias: "Destro", realName: "Ammar Khan", team: "Gladiators", winnings: "$92,200", img: "" },
    { rank: 4, alias: "Sc0utOP", realName: "Tanmay Singh", team: "Team XSpark", winnings: "$45,100", img: "" },
    { rank: 5, alias: "Mavi", realName: "Harmandeep Singh", team: "Global Esports", winnings: "$38,500", img: "" },
    { rank: 6, alias: "Goblin", realName: "Harsh Paudwal", team: "Team Soul", winnings: "$41,200", img: "" },
    { rank: 7, alias: "ClutchGod", realName: "Vivek Aabhas Horo", team: "GodLike", winnings: "$35,900", img: "" },
  ],
  VALORANT: [
    { rank: 1, alias: "Demon1", realName: "Max Mazanov", team: "NRG", winnings: "$250,000", img: "https://owcdn.net/img/632fc843194a2.png" },
    { rank: 2, alias: "TenZ", realName: "Tyson Ngo", team: "Sentinels", winnings: "$180,000", img: "https://owcdn.net/img/60594c03639a0.png" },
    { rank: 3, alias: "Boaster", realName: "Jake Howlett", team: "Fnatic", winnings: "$195,000", img: "https://owcdn.net/img/60c6046e72b4c.png" },
    { rank: 4, alias: "aspas", realName: "Erick Santos", team: "Leviatán", winnings: "$210,000", img: "https://owcdn.net/img/62e0862024227.png" },
    { rank: 5, alias: "f0rsakeN", realName: "Jason Susanto", team: "Paper Rex", winnings: "$140,000", img: "https://owcdn.net/img/614a9a0808168.png" },
  ],
  "FREE FIRE": [
    { rank: 1, alias: "Nobru", realName: "Bruno Goes", team: "Fluxo", winnings: "$55,000", img: "" },
    { rank: 2, alias: "TheDonato", realName: "Donato Muñoz", team: "Donato", winnings: "$48,000", img: "" },
    { rank: 3, alias: "Killer", realName: "Aditya Singh", team: "Total Gaming", winnings: "$32,000", img: "" },
    { rank: 4, alias: "Pahadi", realName: "Lokesh Karakoti", team: "Critical X", winnings: "$28,500", img: "" },
    { rank: 5, alias: "Cerol", realName: "Lucio dos Santos", team: "Fluxo", winnings: "$25,000", img: "" },
  ],
  COD: [
    { rank: 1, alias: "Simp", realName: "Chris Lehr", team: "FaZe Clan", winnings: "$1,200,000", img: "" },
    { rank: 2, alias: "AbeZy", realName: "Tyler Pharris", team: "FaZe Clan", winnings: "$1,150,000", img: "" },
    { rank: 3, alias: "Scump", realName: "Seth Abner", team: "OpTic (Ret)", winnings: "$1,100,000", img: "" },
    { rank: 4, alias: "Shotzzy", realName: "Anthony Cuevas", team: "OpTic Texas", winnings: "$800,000", img: "" },
    { rank: 5, alias: "Crimsix", realName: "Ian Porter", team: "FaZe (Ret)", winnings: "$1,400,000", img: "" },
  ],
  FORTNITE: [
    { rank: 1, alias: "Bugha", realName: "Kyle Giersdorf", team: "Dignitas", winnings: "$3,500,000", img: "" },
    { rank: 2, alias: "EpikWhale", realName: "Shane Cotton", team: "TSM", winnings: "$2,100,000", img: "" },
    { rank: 3, alias: "Tfue", realName: "Turner Tenney", team: "Retired", winnings: "$600,000", img: "" },
    { rank: 4, alias: "Mongraal", realName: "Kyle Jackson", team: "FaZe", winnings: "$700,000", img: "" },
    { rank: 5, alias: "Clix", realName: "Cody Conrod", team: "XSET", winnings: "$450,000", img: "" },
  ]
};

// --- SUB-COMPONENT: Player Avatar ---
const PlayerAvatar = ({ img, name }) => {
  const [imgError, setImgError] = useState(false);
  const initial = name ? name.charAt(0).toUpperCase() : "?";

  if (!img || imgError) {
    return <div className="fallback-avatar">{initial}</div>;
  }
  return <img src={img} alt={name} className="player-img" onError={() => setImgError(true)} />;
};

const parseWinnings = (str) => parseInt(str.replace(/[$,]/g, ""), 10);
const formatWinnings = (num) => "$" + num.toLocaleString();

const RankingsPage = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole") || "player";
  const initialMode = userRole === "scout" ? "PLATFORM" : "ESPORTS";

  const [viewMode, setViewMode] = useState(initialMode); // ESPORTS | PLATFORM
  const [activeGame, setActiveGame] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Platform Data State
  const [platformData, setPlatformData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Esports Data State (Simulated Real-Time)
  const [esportsData, setEsportsData] = useState(INITIAL_DATA);

  // Fetch Platform Data
  useEffect(() => {
    if (viewMode === "PLATFORM") {
      setLoading(true);
      // Map frontend tab names to DB values if needed (e.g. BGMI -> PUBG)
      const queryGame = activeGame === "ALL" ? "ALL" : (activeGame === "BGMI" ? "PUBG" : activeGame);

      api.get(`/api/rankings/platform?game=${encodeURIComponent(queryGame)}`)
        .then(res => {
          setPlatformData(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [viewMode, activeGame]);

  // SIMULATE REAL-TIME UPDATES (Esports Mode)
  useEffect(() => {
    if (viewMode !== "ESPORTS") return;

    const interval = setInterval(() => {
      setEsportsData((prevData) => {
        const newData = { ...prevData };
        let gameToUpdate = activeGame;
        if (gameToUpdate === "ALL") {
          const games = Object.keys(newData);
          gameToUpdate = games[Math.floor(Math.random() * games.length)];
        }
        const gamePlayers = [...newData[gameToUpdate]];

        // Randomly pick a player to "win" prize money
        const randomIndex = Math.floor(Math.random() * gamePlayers.length);
        const player = gamePlayers[randomIndex];
        const currentWinnings = parseWinnings(player.winnings);
        const increment = Math.floor(Math.random() * 500) + 100; // Add $100-$600

        player.winnings = formatWinnings(currentWinnings + increment);

        // Re-sort
        gamePlayers.sort((a, b) => parseWinnings(b.winnings) - parseWinnings(a.winnings));

        // Re-assign ranks
        const rankedPlayers = gamePlayers.map((p, i) => ({ ...p, rank: i + 1 }));

        newData[gameToUpdate] = rankedPlayers;
        return newData;
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [activeGame, viewMode]);

  // Determine Active List
  let listToRender = [];
  if (viewMode === "ESPORTS") {
    if (activeGame === "ALL") {
      const combined = Object.values(esportsData).flat();
      combined.sort((a, b) => parseWinnings(b.winnings) - parseWinnings(a.winnings));
      listToRender = combined.map((p, i) => ({ ...p, rank: i + 1 }));
    } else {
      listToRender = esportsData[activeGame] || [];
    }
  } else {
    listToRender = platformData;
  }

  // Filter
  const filteredPlayers = listToRender.filter((p) =>
    (p.alias || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.realName || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="rankings-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Rajdhani:wght@500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&display=swap');

        :root {
          --red-primary: #c90e1e;
          --bg-black: #050505;
          --bg-card: #0f0f0f;
          --text-white: #ffffff;
          --text-muted: #888888;
          --border-color: #222;
        }

        .rankings-wrapper {
          background-color: var(--bg-black);
          font-family: 'Rajdhani', sans-serif;
          min-height: 100vh;
          color: var(--text-white);
          padding-top: 50px;
          padding-bottom: 80px;
        }

        .container {
          max-width: 1300px;
          margin: 0 auto;
          padding: 0 20px;
        }

        /* HEADER SECTION */
        .rank-header {
          margin-bottom: 40px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .rank-header h1 {
          font-family: 'Teko', sans-serif;
          font-size: 56px;
          text-transform: uppercase;
          line-height: 1;
          margin-bottom: 5px;
        }

        .rank-header span { color: var(--red-primary); }
        .subtitle { color: var(--text-muted); font-size: 18px; }
        
        .live-badge {
            display: flex;
            align-items: center;
            gap: 10px;
            font-family: 'Orbitron', sans-serif;
            color: #ff001f;
            font-size: 14px;
            animation: pulse 2s infinite;
        }
        
        .live-dot {
            width: 8px; height: 8px; background: #ff001f; border-radius: 50%;
            box-shadow: 0 0 10px #ff001f;
        }
        
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }

        /* CONTROLS BAR */
        .controls-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #0f0f0f;
          border: 1px solid var(--border-color);
          padding: 15px 20px;
          margin-bottom: 30px;
          border-radius: 6px;
          flex-wrap: wrap;
          gap: 20px;
        }

        /* --- UPDATED: Hide Scrollbar on Game Tabs --- */
        .game-tabs { 
          display: flex; 
          gap: 15px; 
          overflow-x: auto; 
          
          /* Hide Scrollbar for Firefox */
          scrollbar-width: none; 
          
          /* Hide Scrollbar for IE/Edge */
          -ms-overflow-style: none;
        }

        /* Hide Scrollbar for Chrome/Safari/Webkit */
        .game-tabs::-webkit-scrollbar {
          display: none;
        }

        .tab-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-family: 'Teko', sans-serif;
          font-size: 20px;
          cursor: pointer;
          text-transform: uppercase;
          padding: 5px 10px;
          transition: 0.3s;
          position: relative;
          white-space: nowrap; /* Prevent text wrapping */
        }

        .tab-btn:hover { color: #fff; }
        .tab-btn.active { color: var(--red-primary); }
        .tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -5px; left: 0; width: 100%; height: 2px;
          background: var(--red-primary);
        }

        .search-container {
          position: relative;
          display: flex;
          align-items: center;
        }
        
        .search-input {
          background: #000;
          border: 1px solid var(--border-color);
          padding: 10px 15px 10px 35px;
          color: #fff;
          font-family: 'Rajdhani', sans-serif;
          width: 250px;
          border-radius: 4px;
          outline: none;
        }
        
        .search-icon {
          position: absolute;
          left: 10px;
          color: #666;
        }

        /* LEADERBOARD TABLE - Styled like Reference Image */
        .table-header {
          display: grid;
          grid-template-columns: 80px 3fr 2fr 1.5fr;
          padding: 15px 20px;
          color: var(--text-muted);
          font-weight: 700;
          text-transform: uppercase;
          font-size: 14px;
          letter-spacing: 1px;
          border-bottom: 1px solid var(--border-color);
        }

        .player-row {
          position: relative;
          display: grid;
          grid-template-columns: 80px 3fr 2fr 1.5fr;
          align-items: center;
          padding: 15px 20px;
          background: #0a0a0a;
          border-bottom: 1px solid #1a1a1a;
          transition: all 0.2s ease;
        }

        .player-row-actions {
          position: absolute;
          right: 20px;
          opacity: 0;
          transition: opacity 0.2s;
          display: flex;
          align-items: center;
          height: 100%;
          top: 0;
        }

        .player-row:hover .player-row-actions {
          opacity: 1;
        }

        .chat-action-btn {
          background: var(--red-primary);
          color: white;
          border: none;
          padding: 8px 15px;
          border-radius: 4px;
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background 0.2s;
        }
        .chat-action-btn:hover {
          background: #e61c2d;
        }

        .player-row:hover {
          background: #141414;
          transform: translateX(5px);
          border-left: 3px solid var(--red-primary);
        }

        .rank-col {
          font-family: 'Teko', sans-serif;
          font-size: 24px;
          color: #666;
        }
        
        .rank-1 { color: #FFD700; }
        .rank-2 { color: #C0C0C0; }
        .rank-3 { color: #CD7F32; }

        /* Player Column: Avatar + Name + Real Name */
        .player-col {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .player-img, .fallback-avatar {
          width: 45px;
          height: 45px;
          border-radius: 6px; 
          object-fit: cover;
        }

        .fallback-avatar {
          background: #222;
          display: flex;
          justify-content: center;
          align-items: center;
          color: var(--red-primary);
          font-weight: 700;
          font-size: 20px;
          border: 1px solid #333;
        }

        .player-details { display: flex; flex-direction: column; }
        .alias { font-weight: 700; font-size: 18px; color: #fff; }
        .real-name { font-size: 14px; color: var(--text-muted); }

        /* Team Column */
        .team-col {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          color: #ccc;
        }

        /* Winnings Column (Green/Red/Gold) */
        .winnings-col {
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          color: var(--red-primary);
          font-size: 18px;
        }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .table-header {
            display: none; /* Hide table header on mobile */
          }
          
          .leaderboard-table {
            display: grid;
            gap: 15px; /* Spacing between cards */
          }
          
          .controls-bar { flex-direction: column; align-items: stretch; gap: 15px; padding: 15px; }
          .search-input { width: 100%; box-sizing: border-box; }
          .search-container { width: 100%; }
          .rank-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
            margin-bottom: 25px;
          }
          .rank-header h1 { font-size: 38px; }
          .subtitle { font-size: 14px; }
          
          /* Change row into a premium card */
          .player-row {
            display: flex;
            flex-direction: column;
            background: #111;
            border: 1px solid #222;
            border-radius: 8px;
            padding: 20px;
            position: relative;
            box-shadow: 0 4px 15px rgba(0,0,0,0.4);
          }
          
          .player-row:hover {
            transform: none;
            border-left: 1px solid #222;
            border-color: #333;
          }
          
          .rank-col {
            position: absolute;
            top: 15px;
            right: 20px;
            font-size: 32px;
            opacity: 0.8;
          }

          .player-col { 
            gap: 15px; 
            margin-bottom: 15px;
            align-items: flex-start;
          }
          
          .player-img, .fallback-avatar { width: 50px; height: 50px; font-size: 20px; border-radius: 8px; }
          .alias { font-size: 20px; }
          .real-name { font-size: 14px; margin-bottom: 5px; }
          
          .team-col { 
            display: flex; 
            margin-bottom: 15px;
            font-size: 14px;
            color: #aaa;
          }

          .winnings-col {
            font-size: 24px;
            text-align: left;
            margin-bottom: 10px;
          }
          
          /* Show hover actions persistently on mobile */
          .player-row-actions {
            opacity: 1;
            position: static;
            padding-left: 0;
            width: 100%;
          }
          
          .chat-action-btn { 
            width: 100%; 
            justify-content: center; 
            padding: 12px;
            font-size: 16px;
          }
        }
      `}</style>
      
      <div className="container">
        {/* HEADER */}
        <div className="rank-header">
          <div>
            <h1>Top Esports <span className="highlight">Players</span></h1>
            <p className="subtitle">Ranked by Total Winnings & Performance</p>
          </div>
          {viewMode === "ESPORTS" && (
            <div className="live-badge">
              <span className="live-dot"></span> LIVE UPDATES
            </div>
          )}
        </div>

        {/* MODE TOGGLE */}
        {userRole !== "scout" && (
          <div className="mode-toggle">
            <button
              className={`mode-btn ${viewMode === "ESPORTS" ? "active" : ""}`}
              onClick={() => setViewMode("ESPORTS")}
            >
              <FaGlobe /> GLOBAL ESPORTS
            </button>
            <button
              className={`mode-btn ${viewMode === "PLATFORM" ? "active" : ""}`}
              onClick={() => setViewMode("PLATFORM")}
            >
              <FaUserAstronaut /> PLATFORM USERS
            </button>
          </div>
        )}
        <style>{`
            .mode-toggle { display: flex; gap: 20px; margin-bottom: 20px; border-bottom: 1px solid #222; padding-bottom: 20px; }
            .mode-btn { 
                background: transparent; border: none; color: #666; font-family: 'Teko'; font-size: 24px; 
                display: flex; align-items: center; gap: 10px; cursor: pointer; transition: 0.3s;
            }
            .mode-btn:hover { color: #fff; }
            .mode-btn.active { color: var(--red-primary); }
            @media (max-width: 900px) {
                .mode-toggle { flex-direction: column; gap: 10px; }
                .mode-btn { font-size: 20px; }
            }
        `}</style>

        {/* CONTROLS (Show Game Tabs for BOTH modes) */}
        <div className="controls-bar">
          <div className="game-tabs">
            {["ALL", ...Object.keys(INITIAL_DATA)].map((game) => (
              <button
                key={game}
                className={`tab-btn ${activeGame === game ? "active" : ""}`}
                onClick={() => setActiveGame(game)}
              >
                {game}
              </button>
            ))}
          </div>

          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search player..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* TABLE LAYOUT */}
        <div className="leaderboard-table">
          {/* Table Header */}
          <div className="table-header">
            <div>#</div>
            <div>Player</div>
            <div className="team-col">Team/Role</div>
            <div>{viewMode === "ESPORTS" ? "Total Winnings" : "Platform Score"}</div>
          </div>

          {/* Table Body */}
          {filteredPlayers.length > 0 ? (
            filteredPlayers.map((player) => (
              <div key={player.rank} className="player-row">

                {/* RANK */}
                <div className={`rank-col rank-${player.rank}`}>
                  {player.rank}
                </div>

                {/* PLAYER INFO */}
                <div className="player-col">
                  <PlayerAvatar img={player.img} name={player.alias} />
                  <div className="player-details">
                    <span className="alias">{player.alias}</span>
                    <span className="real-name">{player.realName}</span>
                  </div>
                </div>

                {/* TEAM */}
                <div className="team-col">
                  <FaTrophy size={14} color="#555" /> {player.team}
                </div>

                {/* WINNINGS */}
                <div className="winnings-col">
                  {player.winnings}
                </div>

                {/* HOVER ACTIONS (Platform Mode Only) */}
                {viewMode === "PLATFORM" && (
                  <div className="player-row-actions">
                    <button className="chat-action-btn" onClick={() => navigate('/arena-chat', { state: { newChatUser: player } })}>
                      <FaCommentDots /> Chat
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              No players found.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default RankingsPage;