import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaGoogle, FaRegEye, FaRegEyeSlash, FaFacebook } from "react-icons/fa6";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";
import { jwtDecode } from "jwt-decode";
import api from "../api/Axios";
import { useToast } from "../components/Toast/ToastContext";

// --- IMPORT YOUR LOCAL IMAGE HERE ---
// Ensure this file exists in your assets folder
import AuthBg from "../assets/login.jpg"; 

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLogin, setIsLogin] = useState(location.pathname === "/login");
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // form fields
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    setIsLogin(location.pathname === "/login");
  }, [location.pathname]);

  const handleSwitch = () => {
    const newPath = isLogin ? "/register" : "/login";
    navigate(newPath);
  };

  const { showToast } = useToast();

  const handleSocialBackend = async (data) => {
    try {
      const res = await api.post("/api/auth/social-login", data);
      const token = res.data?.data?.tokens?.accessToken || res.data?.token || res.data?.accessToken;
      const userRole = res.data?.data?.user?.role || res.data?.user?.role || "player";

      if (!token) {
        showToast("Social Login failed. Token not received.", { type: "error" });
        return;
      }
      localStorage.setItem("token", token);
      localStorage.setItem("accessToken", token);
      localStorage.setItem("userRole", userRole);
      
      const loggedInUser = res.data?.data?.user || res.data?.user;
      if (loggedInUser) {
          localStorage.setItem("userInfo", JSON.stringify({ user: loggedInUser }));
      }

      window.dispatchEvent(new Event("authChanged"));
      showToast("Social Login successful!", { type: "success" });
      
      if (userRole === "scout") navigate("/scout-dashboard");
      else navigate("/dashboard");
    } catch (err) {
      console.log(err);
      showToast(err.response?.data?.message || "Social login failed", { type: "error" });
    }
  };

  const handleGoogleSuccess = (credentialResponse) => {
      const decoded = jwtDecode(credentialResponse.credential);
      handleSocialBackend({
          email: decoded.email,
          name: decoded.name,
          authProvider: 'google',
          authProviderId: decoded.sub,
          photoUrl: decoded.picture
      });
  };

  const handleFacebookSuccess = (response) => {
      if(!response || !response.email) {
          showToast("Facebook login failed or email missing", { type: "error"});
          return;
      }
      handleSocialBackend({
          email: response.email,
          name: response.name,
          authProvider: 'facebook',
          authProviderId: response.userID,
          photoUrl: response.picture?.data?.url
      });
  };

  // ==== Forgot Password Logic ====
  const handleForgotPassword = (e) => {
    e.preventDefault();
    setShowForgotModal(true);
  };

  const handleCloseModal = () => {
    setShowForgotModal(false);
    setForgotEmail("");
  };

  const handleConfirmEmail = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/auth/forgot-password", { email: forgotEmail });
      showToast(res.data.message || `OTP sent to: ${forgotEmail}`, { type: "success" });
      setShowForgotModal(false);
      navigate("/reset-password");
    } catch (err) {
      showToast(err.response?.data?.message || "Error sending OTP", { type: "error" });
    }
  };

  // ==== Login & Register Logic ====
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        // LOGIN
        const res = await api.post("/api/auth/login", { email, password });
        const token = res.data?.data?.tokens?.accessToken || res.data?.token || res.data?.accessToken;
        
        // Extract user role if available in the response
        const userRole = res.data?.data?.user?.role || res.data?.user?.role || "player";

        if (!token) {
          showToast("Login failed. Token not received.", { type: "error" });
          return;
        }

        localStorage.setItem("token", token);
        localStorage.setItem("accessToken", token);
        localStorage.setItem("userRole", userRole); // store role for UI checks
        
        // Ensure user details are persistently stored for components to ID the current user
        const loggedInUser = res.data?.data?.user || res.data?.user;
        if (loggedInUser) {
           localStorage.setItem("userInfo", JSON.stringify({ user: loggedInUser }));
        }

        window.dispatchEvent(new Event("authChanged"));
        
        showToast("Login successful!", { type: "success" });
        
        if (userRole === "scout") {
          navigate("/scout-dashboard");
        } else {
          navigate("/dashboard");
        }
      } else {
        // REGISTER
        await api.post("/api/auth/register", {
          userName: fullName,
          email,
          password,
          role,
        });

        showToast("OTP sent to your email for verification.", { type: "success" });
        navigate("/verify-otp", { state: { email } });
      }
    } catch (err) {
      console.log(err);
      showToast(err.response?.data?.message || "Something went wrong", { type: "error" });
    }
  };

  // ==== UI ====
  return (
    <div style={styles.pageBackground}>
        {/* Import Fonts dynamically */}
        <style>
            {`
            @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Orbitron:wght@400;500;800;900&family=Inter:wght@400;500&display=swap');

            /* Custom Scrollbar for form panel */
            .scroll-panel::-webkit-scrollbar {
              width: 6px;
            }
            .scroll-panel::-webkit-scrollbar-track {
              background: #f1f1f1; 
            }
            .scroll-panel::-webkit-scrollbar-thumb {
              background: #ccc; 
              border-radius: 3px;
            }
            .scroll-panel::-webkit-scrollbar-thumb:hover {
              background: #aaa; 
            }

            @media (max-width: 900px) {
              .mobile-hide {
                display: none !important;
              }
              .main-container-responsive {
                width: 100% !important;
                height: auto !important;
                min-height: 100dvh !important;
                border-radius: 0 !important;
                box-shadow: none !important;
                flex-direction: column !important;
              }
            }
            `}
        </style>

      <div style={styles.mainContainer} className="main-container-responsive">
        
        {/* --- LEFT SIDE: Artistic Image --- */}
        <div style={styles.leftPanel} className="mobile-hide">
            <div style={styles.leftContent}>
                <div style={styles.quoteLabel}>
                    <span style={styles.line}></span> GAMING
                </div>
                
                <div style={styles.heroTextContainer}>
                    <h1 style={styles.heroTitle}>The<br/>Fun Of<br/>Respawning</h1>

                </div>
            </div>
            {/* Abstract Overlay (Red Coating) */}
            <div style={styles.imageOverlay}></div>
        </div>

        {/* --- RIGHT SIDE: Form (Scrollable) --- */}
        <div style={styles.rightPanel} className="scroll-panel">
            <div style={styles.formWrapper}>
                
                <div style={styles.brandHeader}>
                    <div style={styles.logo}>✨ eScout</div> 
                </div>

                <div style={styles.headerText}>
                    <h2 style={styles.welcomeTitle}>{isLogin ? "Welcome Back" : "Create Account"}</h2>
                    <p style={styles.welcomeSub}>
                        {isLogin ? "Enter your email and password to access your account" : "Join the community and start competing today"}
                    </p>
                </div>

                {/* Form */}
                <form style={styles.form} onSubmit={handleSubmit}>
                    
                    {!isLogin && (
                        <>
                         <div style={styles.inputGroup}>
                            <label style={styles.label}>Full Name</label>
                            <input
                                type="text"
                                placeholder="Enter your full name"
                                style={styles.input}
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                         </div>
                         <div style={styles.inputGroup}>
                            <label style={styles.label}>Role</label>
                            <select
                                name="role"
                                style={styles.input}
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                required
                            >
                                <option value="">Select Role</option>
                                <option value="player">Player</option>
                                <option value="scout">Scout</option>
                            </select>
                         </div>
                        </>
                    )}

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            style={styles.input}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <div style={styles.passwordWrapper}>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                style={styles.inputPassword}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <span 
                                onClick={() => setShowPassword(!showPassword)} 
                                style={styles.eyeIcon}
                            >
                                {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                            </span>
                        </div>
                    </div>

                    {/* Remember Me & Forgot Password Row */}
                    {isLogin && (
                        <div style={styles.optionsRow}>
                            <label style={styles.checkboxLabel}>
                                <input 
                                    type="checkbox" 
                                    checked={rememberMe} 
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    style={styles.checkbox}
                                />
                                Remember me
                            </label>
                            <button
                                type="button"
                                style={styles.forgotLink}
                                onClick={handleForgotPassword}
                            >
                                Forgot Password?
                            </button>
                        </div>
                    )}

                    {/* Main Button */}
                    <button type="submit" style={styles.signInBtn}>
                        {isLogin ? "Sign In" : "Sign Up"}
                    </button>

                    {/* Social Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "mock-client-id"}>
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => showToast('Google Login Failed', {type: 'error'})}
                                text={isLogin ? "signin_with" : "signup_with"}
                                width="300"
                            />
                        </GoogleOAuthProvider>
                        
                        <FacebookLogin
                            appId={import.meta.env.VITE_FACEBOOK_APP_ID || "18000000000000"}
                            autoLoad={false}
                            fields="name,email,picture"
                            callback={handleFacebookSuccess}
                            render={renderProps => (
                                <button type="button" style={{...styles.googleBtn, width: '100%', borderColor: '#1877F2', color: '#1877F2', height: '40px'}} onClick={renderProps.onClick}>
                                    <FaFacebook style={{ marginRight: "10px", color: "#1877F2" }} /> 
                                    Continue with Facebook
                                </button>
                            )}
                        />
                    </div>

                </form>

                {/* Footer Switch */}
                <div style={styles.footer}>
                    <p style={styles.switchText}>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button style={styles.switchBtn} onClick={handleSwitch}>
                            {isLogin ? "Sign Up" : "Log In"}
                        </button>
                    </p>
                </div>

            </div>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Confirm Your Email</h2>
            <p style={styles.modalText}>
              Enter your registered email address to receive an OTP.
            </p>
            <form onSubmit={handleConfirmEmail}>
              <input
                type="email"
                placeholder="Enter your email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                style={{...styles.input, width: '100%', marginBottom: '15px', boxSizing: 'border-box'}}
              />
              <div style={styles.modalButtons}>
                <button type="submit" style={styles.signInBtn}>Send OTP</button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
  
  // === Left Panel (UPDATED WITH LOCAL IMAGE) ===
  leftPanel: {
    flex: "1",
    position: "relative",
    // Use the imported image variable here
    backgroundImage: `url(${AuthBg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "60px",
    color: "#fff",
  },
  
  // --- RED COATING OVERLAY ---
  imageOverlay: {
    position: "absolute",
    top: 0, 
    left: 0,
    width: "100%",
    height: "100%",
    /* Red Gradient: Starts Dark top -> Fades to Red at bottom */
    background: "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(194, 3, 41, 0.83))", 
    zIndex: 1,
    mixBlendMode: "multiply", // Helps the red soak into the image
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
    fontFamily: "'Orbitron', serif",
    fontSize: "56px",
    lineHeight: "1.1",
    marginBottom: "20px",
    fontWeight: "400",
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
    marginBottom: "25px",
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
    gap: "14px", 
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
  optionsRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "13px",
    marginTop: "-5px",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#666",
    cursor: "pointer",
  },
  checkbox: {
    accentColor: "#000",
  },
  forgotLink: {
    background: "none",
    border: "none",
    color: "#000",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "13px",
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
    marginTop: "5px",
  },
  googleBtn: {
    backgroundColor: "#fff",
    border: "1px solid #e1e1e1",
    padding: "14px",
    borderRadius: "10px",
    fontWeight: "500",
    fontSize: "14px",
    color: "#333",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "0px",
  },
  footer: {
    marginTop: "25px",
    textAlign: "center",
    paddingBottom: "10px",
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

  // === Modal ===
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  modal: {
    background: "#fff",
    padding: "30px",
    borderRadius: "16px",
    width: "350px",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },
  modalTitle: { fontSize: "20px", color: "#000", marginBottom: "10px", fontFamily: "'Orbitron', serif" },
  modalText: { fontSize: "14px", color: "#666", marginBottom: "20px" },
  modalButtons: { display: "flex", flexDirection: "column", gap: "10px" },
  cancelBtn: {
    background: "transparent",
    border: "none",
    color: "#666",
    padding: "10px",
    cursor: "pointer",
  }
};

export default AuthPage;