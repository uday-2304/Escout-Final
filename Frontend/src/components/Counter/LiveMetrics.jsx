import React from "react";
import CountUp from "react-countup";
import "./LiveMetrics.css";

const LiveMetrics = () => {
  const stats = [
    { label: "Players Registered", value: 1200, suffix: "+" },
    { label: "Scouts Active", value: 70, suffix: "+" },
    { label: "Teams Recruiting", value: 25, suffix: "+" },
  ];

  // Helper to create floating particles
  const renderParticles = () => {
    return [...Array(8)].map((_, i) => (
      <span
        key={i}
        className="particle"
        style={{
          // Randomize position and animation speed inline for organic feel
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${3 + Math.random() * 4}s`,
        }}
      ></span>
    ));
  };

  return (
    <section className="live-stats">
      <div className="live-stats-content">
        <h2 className="live-stats-title">
          Community <span>Growth</span>
        </h2>

        <div className="live-stats-grid">
          {stats.map((item, index) => (
            <div key={index} className="live-stats-card">
              {/* --- BACKGROUND PARTICLES --- */}
              <div className="particles-container">{renderParticles()}</div>

              <h3 className="live-stats-number">
                <CountUp
                  start={0}
                  end={item.value}
                  duration={3.5}
                  separator=","
                  suffix={item.suffix}
                  enableScrollSpy={true}
                  scrollSpyOnce={true}
                />
              </h3>
              <p className="live-stats-label">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LiveMetrics;