import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaLock, FaUserAstronaut } from 'react-icons/fa';

const LoginGate = () => {
    return (
        <div className="login-gate">
            <div className="gate-content">
                <div className="icon_container">
                    <FaLock className="lock-icon" />
                </div>
                <h1>ACCESS <span className="highlight">DENIED</span></h1>
                <p>IDENTIFICATION REQUIRED TO ACCESS CLASSIFIED INTEL.</p>

                <NavLink to="/login" className="login-btn">
                    <FaUserAstronaut /> INITIALIZE LOGIN
                </NavLink>
            </div>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Teko:wght@400;600&family=Rajdhani:wght@500;700&display=swap');
        
        .login-gate {
          height: 100vh;
          width: 100vw;
          background-color: #050505;
          background-image: 
            radial-gradient(circle at 50% 50%, rgba(20, 0, 0, 0.5), transparent 70%),
            linear-gradient(0deg, rgba(0,0,0,0.8), transparent 1px), 
            linear-gradient(90deg, rgba(0,0,0,0.8), transparent 1px);
          background-size: 100% 100%, 40px 40px, 40px 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #f0f0f0;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 9999;
        }

        .gate-content {
          text-align: center;
          padding: 60px;
          border: 1px solid #333;
          background: rgba(10, 10, 10, 0.8);
          backdrop-filter: blur(10px);
          max-width: 500px;
          position: relative;
          box-shadow: 0 0 50px rgba(255, 0, 31, 0.1);
          animation: fadeIn 0.5s ease-out;
        }

        .gate-content::before {
          content: '';
          position: absolute;
          top: -2px; left: -2px; right: -2px; bottom: -2px;
          background: linear-gradient(45deg, #ff001f, transparent, #ff001f);
          z-index: -1;
          opacity: 0.3;
        }

        .icon_container {
          width: 80px;
          height: 80px;
          margin: 0 auto 30px;
          border: 2px solid #ff001f;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px rgba(255, 0, 31, 0.4);
        }

        .lock-icon {
          font-size: 30px;
          color: #ff001f;
        }

        h1 {
          font-family: 'Teko', sans-serif;
          font-size: 60px;
          line-height: 1;
          margin-bottom: 10px;
          letter-spacing: 2px;
        }

        .highlight { color: #ff001f; }

        p {
          font-family: 'Rajdhani', sans-serif;
          color: #888;
          font-size: 16px;
          letter-spacing: 1px;
          margin-bottom: 40px;
        }

        .login-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #ff001f;
          color: #fff;
          text-decoration: none;
          padding: 15px 40px;
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          font-size: 18px;
          letter-spacing: 2px;
          transition: all 0.3s;
          clip-path: polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%);
        }

        .login-btn:hover {
          background: #fff;
          color: #ff001f;
          box-shadow: 0 0 30px rgba(255, 0, 31, 0.6);
          transform: translateY(-2px);
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
        </div>
    );
};

export default LoginGate;