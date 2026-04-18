import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/Axios";
import { useToast } from "../components/Toast/ToastContext";

const OtpPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "your email";
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Countdown for resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Handle OTP verification
  const { showToast } = useToast();

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/api/auth/verify-otp", { otp });
      showToast("✅ Account verified successfully!", { type: "success" });
      navigate("/login");
    } catch (err) {
      showToast(err.response?.data?.message || "❌ Invalid or expired OTP", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    try {
      setResendTimer(30); // 30 sec cooldown
      await api.post("/api/auth/resend-otp", { email });
      showToast("📩 New OTP sent to your email!", { type: "success" });
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to resend OTP", { type: "error" });
    }
  };

  return (
    <div style={styles.pageBackground}>
      {/* Import Fonts dynamically */}
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Poppins:wght@300;400;500;600&display=swap');
        .scroll-panel::-webkit-scrollbar { width: 6px; }
        .scroll-panel::-webkit-scrollbar-track { background: #f1f1f1; }
        .scroll-panel::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
        .scroll-panel::-webkit-scrollbar-thumb:hover { background: #aaa; }
        `}
      </style>

      <div style={styles.mainContainer}>
        
        {/* --- LEFT SIDE: Esports Arena Image --- */}
        <div style={styles.leftPanel}>
          <div style={styles.leftContent}>
            <div style={styles.quoteLabel}>
              <span style={styles.line}></span> FINAL STEP
            </div>
            
            <div style={styles.heroTextContainer}>
              <h1 style={styles.heroTitle}>Unlock <br/>Your <br/>Potential</h1>
              <p style={styles.heroSubtitle}>
                Verify your identity to access exclusive tournaments and start your journey to pro status.
              </p>
            </div>
          </div>
          {/* Overlay */}
          <div style={styles.imageOverlay}></div>
        </div>

        {/* --- RIGHT SIDE: Form --- */}
        <div style={styles.rightPanel} className="scroll-panel">
          <div style={styles.formWrapper}>
            
            <div style={styles.brandHeader}>
              <div style={styles.logo}>✨ eScout</div> 
            </div>

            <div style={styles.headerText}>
              <h2 style={styles.welcomeTitle}>Verify Email</h2>
              <p style={styles.welcomeSub}>
                We've sent a 6-digit code to <br/>
                <span style={{ fontWeight: "600", color: "#000" }}>{email}</span>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} style={styles.form}>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>Enter OTP Code</label>
                <input
                  type="text"
                  placeholder="X X X X X X"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                  style={{...styles.input, textAlign: "center", letterSpacing: "5px", fontSize: "18px"}}
                />
              </div>

              <button 
                type="submit" 
                style={{
                  ...styles.signInBtn,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "not-allowed" : "pointer"
                }}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify & Proceed"}
              </button>

            </form>

            <div style={styles.footer}>
              {resendTimer > 0 ? (
                <p style={styles.timerText}>
                  Resend code in <span style={{fontWeight:'bold'}}>{resendTimer}s</span>
                </p>
              ) : (
                <button onClick={handleResendOtp} style={styles.resendBtn}>
                  Didn't receive code? <b>Resend</b>
                </button>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

/* === Styles === */
const styles = {
  pageBackground: {
    height: "100vh",
    width: "100%",
    backgroundColor: "#000",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "'Poppins', sans-serif",
  },
  mainContainer: {
    width: "90%",
    maxWidth: "1100px",
    height: "85vh",
    minHeight: "600px",
    backgroundColor: "#fff",
    borderRadius: "30px",
    display: "flex",
    overflow: "hidden",
    boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
  },
  
  // === Left Panel ===
  leftPanel: {
    flex: "1",
    position: "relative",
    // Same high-quality Esports Arena image
    backgroundImage: "url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "60px",
    color: "#fff",
  },
  imageOverlay: {
    position: "absolute",
    top: 0, 
    left: 0,
    width: "100%",
    height: "100%",
    background: "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7))",
    zIndex: 1,
  },
  leftContent: {
    position: "relative",
    zIndex: 2,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  quoteLabel: {
    fontSize: "12px",
    letterSpacing: "2px",
    textTransform: "uppercase",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontWeight: "500",
  },
  line: {
    width: "30px",
    height: "1px",
    backgroundColor: "#fff",
  },
  heroTextContainer: {
    marginBottom: "20px",
  },
  heroTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "56px",
    lineHeight: "1.1",
    marginBottom: "20px",
    fontWeight: "400",
  },
  heroSubtitle: {
    fontSize: "14px",
    opacity: "0.8",
    maxWidth: "300px",
    lineHeight: "1.6",
  },

  // === Right Panel ===
  rightPanel: {
    flex: "1",
    backgroundColor: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px",
    position: "relative",
    overflowY: "auto",
  },
  formWrapper: {
    width: "100%",
    maxWidth: "380px",
    margin: "auto 0",
  },
  brandHeader: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "20px",
  },
  logo: {
    fontWeight: "bold",
    fontSize: "18px",
    color: "#000",
  },
  headerText: {
    marginBottom: "30px",
    textAlign: "left",
  },
  welcomeTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "32px",
    color: "#000",
    marginBottom: "10px",
    fontWeight: "600",
  },
  welcomeSub: {
    color: "#666",
    fontSize: "14px",
    lineHeight: "1.5",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#333",
  },
  input: {
    padding: "14px 16px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#f4f6f8",
    color: "#333",
    fontSize: "14px",
    outline: "none",
    transition: "box-shadow 0.2s",
  },
  signInBtn: {
    backgroundColor: "#000",
    color: "#fff",
    padding: "15px",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "15px",
    border: "none",
    cursor: "pointer",
    marginTop: "10px",
  },
  footer: {
    marginTop: "30px",
    textAlign: "center",
  },
  timerText: {
    fontSize: "14px",
    color: "#666",
  },
  resendBtn: {
    background: "none",
    border: "none",
    color: "#000",
    fontSize: "14px",
    cursor: "pointer",
  },
};

export default OtpPage;