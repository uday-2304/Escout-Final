import React, { useState, useEffect } from "react";
import { FaSearch, FaTrophy, FaUserAstronaut, FaGlobe, FaCommentDots } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../api/Axios";

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

  const [viewMode, setViewMode] = useState(initialMode);
  const [activeGame, setActiveGame] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const [platformData, setPlatformData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [esportsData, setEsportsData] = useState(INITIAL_DATA);

  useEffect(() => {
    if (viewMode === "PLATFORM") {
      setLoading(true);
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

        const randomIndex = Math.floor(Math.random() * gamePlayers.length);
        const player = gamePlayers[randomIndex];
        const currentWinnings = parseWinnings(player.winnings);
        const increment = Math.floor(Math.random() * 500) + 100;

        player.winnings = formatWinnings(currentWinnings + increment);

        gamePlayers.sort((a, b) => parseWinnings(b.winnings) - parseWinnings(a.winnings));

        const rankedPlayers = gamePlayers.map((p, i) => ({ ...p, rank: i + 1 }));

        newData[gameToUpdate] = rankedPlayers;
        return newData;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [activeGame, viewMode]);

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
          --red-primary: #e61c2d;
          --red-dark: #b81422;
          --bg-black: #080808;
          --bg-card: #121212;
          --text-white: #ffffff;
          --text-muted: #999999;
          --border-color: #2a2a2a;
          --rank-gold: #FFD700;
          --rank-silver: #C0C0C0;
          --rank-bronze: #CD7F32;
        }

        .rankings-wrapper {
          background-color: var(--bg-black);
          font-family: 'Rajdhani', sans-serif;
          min-height: 100vh;
          color: var(--text-white);
          padding-top: 60px;
          padding-bottom: 80px;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .rank-header {
          margin-bottom: 40px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 20px;
        }

        .rank-header h1 {
          font-family: 'Teko', sans-serif;
          font-size: 64px;
          text-transform: uppercase;
          line-height: 0.9;
          margin-bottom: 8px;
          letter-spacing: 1px;
        }

        .rank-header span { color: var(--red-primary); }
        .subtitle { color: var(--text-muted); font-size: 18px; font-weight: 500; }
        
        .live-badge {
            display: flex;
            align-items: center;
            gap: 10px;
            font-family: 'Orbitron', sans-serif;
            color: var(--red-primary);
            font-size: 14px;
            font-weight: 600;
            background: rgba(230, 28, 45, 0.1);
            padding: 8px 16px;
            border-radius: 30px;
            border: 1px solid rgba(230, 28, 45, 0.3);
            animation: pulse 2s infinite;
        }
        
        .live-dot {
            width: 8px; height: 8px; background: var(--red-primary); border-radius: 50%;
            box-shadow: 0 0 10px var(--red-primary);
        }
        
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(230, 28, 45, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(230, 28, 45, 0); }
            100% { box-shadow: 0 0 0 0 rgba(230, 28, 45, 0); }
        }

        .controls-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          padding: 16px 24px;
          margin-bottom: 30px;
          border-radius: 12px;
          flex-wrap: wrap;
          gap: 20px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        }

        .game-tabs { 
          display: flex; 
          gap: 24px; 
          overflow-x: auto; 
          scrollbar-width: none; 
          -ms-overflow-style: none;
          -webkit-overflow-scrolling: touch;
        }

        .game-tabs::-webkit-scrollbar {
          display: none;
        }

        .tab-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-family: 'Teko', sans-serif;
          font-size: 24px;
          cursor: pointer;
          text-transform: uppercase;
          padding: 4px 0;
          transition: 0.3s ease;
          position: relative;
          white-space: nowrap;
          letter-spacing: 1px;
        }

        .tab-btn:hover { color: #fff; }
        .tab-btn.active { color: var(--red-primary); }
        .tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -4px; left: 0; width: 100%; height: 3px;
          background: var(--red-primary);
          border-radius: 4px;
        }

        .search-container {
          position: relative;
          display: flex;
          align-items: center;
          flex: 1;
          max-width: 320px;
        }
        
        .search-input {
          background: #000;
          border: 1px solid var(--border-color);
          padding: 12px 16px 12px 44px;
          color: #fff;
          font-family: 'Rajdhani', sans-serif;
          font-size: 16px;
          font-weight: 500;
          width: 100%;
          border-radius: 8px;
          outline: none;
          transition: border-color 0.3s;
        }

        .search-input:focus {
          border-color: var(--red-primary);
        }
        
        .search-icon {
          position: absolute;
          left: 16px;
          color: #666;
          font-size: 18px;
        }

        .table-header {
          display: grid;
          grid-template-columns: 80px 3fr 2fr 1.5fr;
          padding: 16px 24px;
          color: var(--text-muted);
          font-weight: 700;
          text-transform: uppercase;
          font-size: 15px;
          letter-spacing: 1px;
          border-bottom: 2px solid var(--border-color);
        }

        .player-row {
          position: relative;
          display: grid;
          grid-template-columns: 80px 3fr 2fr 1.5fr;
          align-items: center;
          padding: 20px 24px;
          background: var(--bg-card);
          border-bottom: 1px solid var(--border-color);
          transition: all 0.2s ease;
        }

        .player-row:last-child {
          border-bottom: none;
          border-radius: 0 0 12px 12px;
        }

        .player-row-actions {
          position: absolute;
          right: 24px;
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
          padding: 10px 20px;
          border-radius: 6px;
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: background 0.2s, transform 0.1s;
          box-shadow: 0 4px 12px rgba(230, 28, 45, 0.3);
        }
        .chat-action-btn:hover {
          background: var(--red-dark);
          transform: translateY(-2px);
        }

        .player-row:hover {
          background: #1a1a1a;
          transform: translateX(8px);
          border-left: 4px solid var(--red-primary);
        }

        .rank-col {
          font-family: 'Teko', sans-serif;
          font-size: 32px;
          color: #666;
          line-height: 1;
        }
        
        .rank-1 { color: var(--rank-gold); text-shadow: 0 0 12px rgba(255, 215, 0, 0.4); }
        .rank-2 { color: var(--rank-silver); text-shadow: 0 0 12px rgba(192, 192, 192, 0.4); }
        .rank-3 { color: var(--rank-bronze); text-shadow: 0 0 12px rgba(205, 127, 50, 0.4); }

        .player-col {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .player-img, .fallback-avatar {
          width: 54px;
          height: 54px;
          border-radius: 10px; 
          object-fit: cover;
          box-shadow: 0 4px 10px rgba(0,0,0,0.5);
        }

        .fallback-avatar {
          background: #1a1a1a;
          display: flex;
          justify-content: center;
          align-items: center;
          color: var(--text-white);
          font-weight: 700;
          font-family: 'Teko', sans-serif;
          font-size: 28px;
          border: 2px solid #333;
        }

        .player-details { display: flex; flex-direction: column; }
        .alias { font-weight: 700; font-size: 20px; color: #fff; letter-spacing: 0.5px; }
        .real-name { font-size: 15px; color: var(--text-muted); font-weight: 500; }

        .team-col {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          color: #ccc;
          font-size: 16px;
        }

        .winnings-col {
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          color: var(--red-primary);
          font-size: 22px;
        }

        @media (max-width: 900px) {
          .table-header {
            display: none; 
          }
          
          .leaderboard-table {
            display: grid;
            gap: 16px;
          }
          
          .controls-bar { 
            flex-direction: column; 
            align-items: flex-start; 
            padding: 20px; 
            border-radius: 16px;
          }
          
          .search-container { 
            width: 100%; 
            max-width: 100%;
            margin-top: 8px;
          }

          .game-tabs {
            width: 100%;
            padding-bottom: 8px;
          }
          
          .rank-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
            margin-bottom: 32px;
          }
          
          .rank-header h1 { font-size: 48px; }
          .subtitle { font-size: 16px; }
          
          .player-row {
            display: flex;
            flex-direction: column;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 24px;
            position: relative;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
          }
          
          .player-row:hover {
            transform: translateY(-4px);
            border-left: 1px solid var(--border-color);
            border-color: #333;
          }
          
          .rank-col {
            position: absolute;
            top: 24px;
            right: 24px;
            font-size: 48px;
            opacity: 0.9;
          }

          .player-col { 
            gap: 16px; 
            margin-bottom: 20px;
            align-items: center;
            width: 100%;
            padding-right: 60px; 
          }
          
          .player-img, .fallback-avatar { 
            width: 64px; 
            height: 64px; 
            font-size: 32px; 
            border-radius: 12px; 
          }
          
          .alias { font-size: 24px; }
          .real-name { font-size: 16px; }
          
          .team-col { 
            display: flex; 
            margin-bottom: 16px;
            font-size: 16px;
            color: #bbb;
            width: 100%;
            justify-content: flex-start;
          }

          .winnings-col {
            font-size: 28px;
            text-align: left;
            margin-bottom: 20px;
            width: 100%;
          }
          
          .player-row-actions {
            opacity: 1;
            position: static;
            width: 100%;
            margin-top: 8px;
          }
          
          .chat-action-btn { 
            width: 100%; 
            justify-content: center; 
            padding: 14px;
            font-size: 18px;
            border-radius: 8px;
          }
        }
      `}</style>
      
      <div className="container">
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
            .mode-toggle { display: flex; gap: 30px; margin-bottom: 30px; border-bottom: 2px solid var(--border-color); padding-bottom: 20px; }
            .mode-btn { 
                background: transparent; border: none; color: #666; font-family: 'Teko', sans-serif; font-size: 28px; 
                display: flex; align-items: center; gap: 12px; cursor: pointer; transition: 0.3s;
                letter-spacing: 1px;
            }
            .mode-btn:hover { color: #fff; }
            .mode-btn.active { color: var(--red-primary); }
            @media (max-width: 900px) {
                .mode-toggle { flex-direction: column; gap: 16px; }
                .mode-btn { font-size: 24px; }
            }
        `}</style>

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

        <div className="leaderboard-table">
          <div className="table-header">
            <div>#</div>
            <div>Player</div>
            <div className="team-col">Team/Role</div>
            <div>{viewMode === "ESPORTS" ? "Total Winnings" : "Platform Score"}</div>
          </div>

          {filteredPlayers.length > 0 ? (
            filteredPlayers.map((player) => (
              <div key={player.rank} className="player-row">

                <div className={`rank-col rank-${player.rank}`}>
                  {player.rank}
                </div>

                <div className="player-col">
                  <PlayerAvatar img={player.img} name={player.alias} />
                  <div className="player-details">
                    <span className="alias">{player.alias}</span>
                    <span className="real-name">{player.realName}</span>
                  </div>
                </div>

                <div className="team-col">
                  <FaTrophy size={16} color="#555" /> {player.team}
                </div>

                <div className="winnings-col">
                  {player.winnings}
                </div>

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
            <div style={{ textAlign: 'center', padding: '60px', color: '#666', fontSize: '20px', fontFamily: 'Rajdhani' }}>
              No players found matching your search.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default RankingsPage;