import React, { useState } from "react";
import { FaExternalLinkAlt, FaGamepad } from "react-icons/fa";

const TournamentsPage = () => {
  // State to handle loading or fallback behavior
  const [isLoading, setIsLoading] = useState(true);

  // The new website URL from your image
  const TOURNAMENT_URL = "https://battlefy.com/apex-legends-global-series-year-6/preseason-qualifiers?region=americas";

  return (
    <div className="tournaments-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Rajdhani:wght@500;600;700&display=swap');

        :root {
          --red-primary: #a6000e; 
          --bg-black: #050505;
          --text-white: #ffffff;
        }

        .tournaments-wrapper {
          background-color: var(--bg-black);
          font-family: 'Rajdhani', sans-serif;
          height: 100vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* === HEADER SECTION === */
        .header-bar {
          height: 80px;
          background: linear-gradient(90deg, #000 0%, #1a0000 100%);
          border-bottom: 3px solid var(--red-primary);
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 40px;
          box-shadow: 0 10px 30px rgba(166, 0, 14, 0.2);
          z-index: 10;
        }

        .brand-title {
          font-family: 'Teko', sans-serif;
          font-size: 32px;
          color: #fff;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .brand-title span {
          color: var(--red-primary);
        }

        .external-btn {
          background: var(--red-primary);
          color: #fff;
          border: none;
          padding: 10px 20px;
          font-family: 'Teko', sans-serif;
          font-size: 18px;
          text-transform: uppercase;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: background 0.3s;
          clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
        }

        .external-btn:hover {
          background: #fff;
          color: #000;
        }

        /* === IFRAME CONTAINER === */
        .iframe-container {
          flex: 1;
          position: relative;
          width: 100%;
          background-color: #000;
        }

        .styled-iframe {
          width: 100%;
          height: 100%;
          border: none;
        }

        /* Fallback message */
        .fallback-msg {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          color: #666;
          z-index: 0;
        }
      `}</style>

      {/* --- HEADER --- */}
      <div className="header-bar">
        <div className="brand-title">
          <FaGamepad /> BATTLEFY <span>HUB</span>
        </div>
        <button
          className="external-btn"
          onClick={() => window.open(TOURNAMENT_URL, "_blank")}
        >
          Open Original Site <FaExternalLinkAlt size={14} />
        </button>
      </div>

      {/* --- IFRAME AREA --- */}
      <div className="iframe-container">
        <div className="fallback-msg">
          Loading Tournament Feed... <br />
          <small>If content does not appear, please use the button above.</small>
        </div>

        <iframe
          src={TOURNAMENT_URL}
          className="styled-iframe"
          title="Battlefy Tournaments"
          onLoad={() => setIsLoading(false)}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          style={{ position: 'relative', zIndex: 1 }}
        />
      </div>

    </div>
  );
};

export default TournamentsPage;