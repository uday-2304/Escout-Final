import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import api from "../api/Axios";
import { useToast } from "../components/Toast/ToastContext";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { showToast } = useToast();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/api/auth/reset-password", {
        email,
        otp,
        newPassword,
      });
      showToast(res.data.message || "Password reset successful!", { type: "success" });
      navigate("/login");
    } catch (err) {
      showToast(err.response?.data?.message || "Something went wrong", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageBackground}>
      {/* Import Fonts */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Poppins:wght@300;400;500;600&display=swap');
          .scroll-panel::-webkit-scrollbar { width: 6px; }
          .scroll-panel::-webkit-scrollbar-track { background: #f1f1f1; }
          .scroll-panel::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
        `}
      </style>

      <div style={styles.mainContainer}>
        
        {/* --- LEFT SIDE: Visual --- */}
        <div style={styles.leftPanel}>
            <div style={styles.leftContent}>
                <div style={styles.quoteLabel}>
                    <span style={styles.line}></span> SECURITY FIRST
                </div>
                
                <div style={styles.heroTextContainer}>
                    <h1 style={styles.heroTitle}>Secure <br/>Your <br/>Account</h1>
                    <p style={styles.heroSubtitle}>
                        Get back into the game. Reset your password and reclaim your spot on the leaderboard.
                    </p>
                </div>
            </div>
            <div style={styles.imageOverlay}></div>
        </div>

        {/* --- RIGHT SIDE: Form --- */}
        <div style={styles.rightPanel} className="scroll-panel">
            <div style={styles.formWrapper}>
                
                <div style={styles.brandHeader}>
                    <div style={styles.logo}>✨ eScout</div> 
                </div>

                <div style={styles.headerText}>
                    <h2 style={styles.welcomeTitle}>Reset Password</h2>
                    <p style={styles.welcomeSub}>
                        Enter your email, the OTP sent to you, and your new password below.
                    </p>
                </div>

                <form style={styles.form} onSubmit={handleResetPassword}>
                    
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email Address</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>OTP Code</label>
                        <input
                            type="text"
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>New Password</label>
                        <div style={styles.passwordWrapper}>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                style={styles.inputPassword}
                            />
                            <span 
                                onClick={() => setShowPassword(!showPassword)} 
                                style={styles.eyeIcon}
                            >
                                {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                            </span>
                        </div>
                    </div>

                    <button type="submit" style={styles.signInBtn} disabled={loading}>
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>

                </form>

                <div style={styles.footer}>
                    <p style={styles.switchText}>
                        Remembered your password? 
                        <button 
                            style={styles.switchBtn} 
                            onClick={() => navigate("/login")}
                        >
                            Log In
                        </button>
                    </p>
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
    // Same Esports Arena image for consistency
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
    top: 0, left: 0, width: "100%", height: "100%",
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
    padding: "30px 40px",
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
    marginBottom: "8px",
    fontWeight: "600",
  },
  welcomeSub: {
    color: "#666",
    fontSize: "14px",
    lineHeight: "1.4",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#333",
  },
  input: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#f4f6f8",
    color: "#333",
    fontSize: "14px",
    outline: "none",
    transition: "box-shadow 0.2s",
  },
  passwordWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    backgroundColor: "#f4f6f8",
    borderRadius: "10px",
  },
  inputPassword: {
    flex: 1,
    padding: "12px 16px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "transparent",
    color: "#333",
    fontSize: "14px",
    outline: "none",
  },
  eyeIcon: {
    padding: "0 15px",
    cursor: "pointer",
    color: "#777",
    display: "flex",
    alignItems: "center",
  },
  signInBtn: {
    backgroundColor: "#000",
    color: "#fff",
    padding: "14px",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "15px",
    border: "none",
    cursor: "pointer",
    marginTop: "10px",
  },
  footer: {
    marginTop: "25px",
    textAlign: "center",
  },
  switchText: {
    fontSize: "13px",
    color: "#666",
  },
  switchBtn: {
    background: "none",
    border: "none",
    color: "#000",
    fontWeight: "700",
    cursor: "pointer",
    textDecoration: "underline",
    marginLeft: "5px",
  },
};

export default ResetPasswordPage;