// import React, { useState } from "react";
// import "./Login.css";

// const LoginPage = () => {
//   const [isSignUp, setIsSignUp] = useState(false);
//   const [formData, setFormData] = useState({
//     fullName: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//     company: "",
//     contact: "",
//     orgCode: "",
//     role: "",
//   });

//   // Auto-detect user role based on email domain
//   const detectUserRole = (email) => {
//     if (!email) return "";
//     if (email.endsWith("@admin.com")) return "Admin";
//     if (email.endsWith("@supplier.com")) return "Supplier";
//     if (email.endsWith("@retail.com")) return "Retailer";
//     return "";
//   };

//   const handleInputChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     if (isSignUp) {
//       if (formData.password !== formData.confirmPassword) {
//         alert("Passwords do not match!");
//         return;
//       }

//       const detectedRole = detectUserRole(formData.email) || formData.role;
//       alert(
//         `✅ Account Created!\nName: ${formData.fullName}\nEmail: ${formData.email}\nRole: ${detectedRole}`
//       );
//     } else {
//       alert(`✅ Login Successful!\nEmail: ${formData.email}`);
//     }

//     setFormData({
//       fullName: "",
//       email: "",
//       password: "",
//       confirmPassword: "",
//       company: "",
//       contact: "",
//       orgCode: "",
//       role: "",
//     });
//   };

//   const handleGoogleLogin = () => alert("🔗 Google login integration goes here!");
//   const handleFacebookLogin = () => alert("🔗 Facebook login integration goes here!");
//   const toggleForm = () => setIsSignUp(!isSignUp);

//   const detectedRole = detectUserRole(formData.email);

//   return (
//     <div className="login-container">
//       <div className="login-wrapper">
//         <div className="login-card">
//           <div className="login-header">
//             <h1 className="brand-name">FURNISTØR</h1>
//             <p className="brand-tagline">Find the spare part for every model 🚗</p>
//           </div>

//           <div className="login-form-section">
//             <div className="welcome-text">
//               <h2 className="welcome-title">
//                 {isSignUp ? "Create Your Account" : "Welcome Back!"}
//               </h2>
//               <p className="welcome-subtitle">
//                 {isSignUp
//                   ? "Join the network and grow your business"
//                   : "Login to manage your supply chain"}
//               </p>
//             </div>

//             <div className="social-buttons">
//               <button onClick={handleGoogleLogin} className="social-btn google">
//                 <img
//                   src="https://cdn-icons-png.flaticon.com/512/300/300221.png"
//                   alt="Google"
//                   className="social-icon"
//                 />
//                 Continue with Google
//               </button>
//               <button onClick={handleFacebookLogin} className="social-btn facebook">
//                 <img
//                   src="https://cdn-icons-png.flaticon.com/512/733/733547.png"
//                   alt="Facebook"
//                   className="social-icon"
//                 />
//                 Continue with Facebook
//               </button>
//             </div>

//             <div className="divider">
//               <div className="divider-line"></div>
//               <span className="divider-text">OR</span>
//               <div className="divider-line"></div>
//             </div>

//             <form onSubmit={handleSubmit}>
//               {isSignUp && (
//                 <>
//                   <div className="form-group">
//                     <label className="form-label">Full Name</label>
//                     <input
//                       type="text"
//                       name="fullName"
//                       value={formData.fullName}
//                       onChange={handleInputChange}
//                       placeholder="Enter your name"
//                       className="form-input"
//                       required
//                     />
//                   </div>

//                   <div className="form-group">
//                     <label className="form-label">Company Name</label>
//                     <input
//                       type="text"
//                       name="company"
//                       value={formData.company}
//                       onChange={handleInputChange}
//                       placeholder="Company name"
//                       className="form-input"
//                     />
//                   </div>
//                 </>
//               )}

//               <div className="form-group">
//                 <label className="form-label">Email Address</label>
//                 <input
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleInputChange}
//                   placeholder="example@supplier.com"
//                   className="form-input"
//                   required
//                 />
//               </div>

//               <div className="form-group">
//                 <label className="form-label">Password</label>
//                 <input
//                   type="password"
//                   name="password"
//                   value={formData.password}
//                   onChange={handleInputChange}
//                   placeholder="Enter password"
//                   className="form-input"
//                   required
//                 />
//               </div>

//               {isSignUp && (
//                 <>
//                   <div className="form-group">
//                     <label className="form-label">Confirm Password</label>
//                     <input
//                       type="password"
//                       name="confirmPassword"
//                       value={formData.confirmPassword}
//                       onChange={handleInputChange}
//                       placeholder="Confirm password"
//                       className="form-input"
//                       required
//                     />
//                   </div>

//                   {detectedRole ? (
//                     <div className="role-display">
//                       Detected Role: <strong>{detectedRole}</strong>
//                     </div>
//                   ) : (
//                     <div className="form-group">
//                       <label className="form-label">Select Your Role</label>
//                       <select
//                         name="role"
//                         value={formData.role}
//                         onChange={handleInputChange}
//                         className="form-input"
//                         required
//                       >
//                         <option value="">Select Role</option>
//                         <option value="Admin">Admin</option>
//                         <option value="Supplier">Supplier</option>
//                         <option value="Retailer">Retailer</option>
//                         <option value="Customer">Customer</option>
//                       </select>
//                     </div>
//                   )}
//                 </>
//               )}

//               {!isSignUp && (
//                 <div className="form-options">
//                   <label className="remember-me">
//                     <input type="checkbox" /> Remember Me
//                   </label>
//                   <a href="#" className="forgot-password">
//                     Forgot Password?
//                   </a>
//                 </div>
//               )}
               
//               <button type="submit" className="submit-btn">
//                 {isSignUp ? "Sign Up" : "Login"}
//               </button>
//             </form>

//             <div className="form-footer">
//               <br />
//               <p>
//                 {isSignUp
//                   ? "Already have an account?"
//                   : "Don't have an account?"}{" "}
//                 <button onClick={toggleForm} className="toggle-btn">
//                   {isSignUp ? "Login" : "Sign Up"}
//                 </button>
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;
