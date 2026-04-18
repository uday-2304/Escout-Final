import React from "react";
import { useNavigate } from "react-router-dom"; 
import "./Program.css";
import ImgValorant from '../../assets/img6.png';
import ImgPubg from '../../assets/img3.jpg';
import ImgCod from '../../assets/cod.jpg';
import ImgFortnite from '../../assets/fortnite.jpg';
import ImgFreeFire from '../../assets/img2.jpg';
import ImgLol from '../../assets/legends.jpg';
import ImgCS2 from '../../assets/cs2.jpg';
import ImgDota from '../../assets/dota2.jpg';
import { Crosshair } from "lucide-react"; 

export default function Program() {
  const navigate = useNavigate();

  const games = [
    { name: "VALORANT", genre: "TACTICAL FPS", img: ImgValorant },
    { name: "LEAGUE OF LEGENDS", genre: "MOBA", img: ImgLol },
    { name: "CS2", genre: "TACTICAL SHOOTER", img: ImgCS2 },
    { name: "PUBG MOBILE", genre: "BATTLE ROYALE", img: ImgPubg },
    { name: "DOTA 2", genre: "STRATEGY", img: ImgDota },
    { name: "CALL OF DUTY", genre: "FPS", img: ImgCod },
    { name: "FORTNITE", genre: "BUILD & BATTLE", img: ImgFortnite },
    { name: "FREE FIRE", genre: "SURVIVAL", img: ImgFreeFire },
  ];

  const handleFindTournaments = () => {
    navigate('/tournaments');
  };

  return (
    <section className="program-section">
      <div className="program-header">
        <h2 className="program-title">ACTIVE <span className="text-red">WARZONES</span></h2>
        <p className="program-subtitle">SELECT YOUR DISCIPLINE</p>
      </div>

      <div className="games-grid">
        {games.map((game, index) => (
          <div className="game-card" key={index}>
            <div className="card-media">
              <img src={game.img} alt={game.name} />
              <div className="overlay-gradient"></div>
            </div>
            
            <div className="card-details">
              <div className="text-area">
                <span className="game-genre">{game.genre}</span>
                <h3 className="game-name">{game.name}</h3>
              </div>
              
              {/* REMOVED INDIVIDUAL BUTTON FROM HERE */}
            </div>

            {/* --- Corner Bullets --- */}
            <div className="bullet b-tl"></div>
            <div className="bullet b-tr"></div>
            <div className="bullet b-bl"></div>
            <div className="bullet b-br"></div>

          </div>
        ))}
      </div>

      {/* --- NEW BIG BUTTON BELOW GRID --- */}
      <div className="button-container">
        <button 
          className="big-action-btn"
          onClick={handleFindTournaments}
        >
          <span>FIND TOURNAMENTS</span>
          <Crosshair size={24} className="scope-icon" />
        </button>
      </div>

    </section>
  );
}