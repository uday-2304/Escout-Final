import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import {Server} from 'socket.io'

import userRouter from "./routes/user.routes.js";
import authRouter from "./routes/authRoutes.js";
import arenaRoutes from "./routes/arenaRoutes.js";
import dashboardVideoRoutes from "./routes/dashboardRoutes.js";
import rankingsRoutes from "./routes/rankingsRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import { handleSockets } from "./sockets/socketHandler.js";

const app = express();

/* ================= CORS CONFIG ================= */

const allowedOrigins = [
  "http://localhost:5173",
  "https://escout-scouting.vercel.app",
  "https://escout-final.onrender.com"
];

const corsOptions = {
origin: function (origin, callback) {
// allow requests with no origin (like mobile apps / postman)
if (
!origin ||
allowedOrigins.includes(origin) ||
(origin && origin.startsWith("http://localhost")) ||
(origin && origin.endsWith(".vercel.app"))
) {
callback(null, true);
} else {
console.error("❌ Blocked by CORS:", origin);
callback(new Error("Not allowed by CORS"));
}
},
credentials: true,
methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
};

// Apply CORS middleware
app.use(cors(corsOptions));

// NOTE: Preflight requests are handled automatically by the cors middleware above.
// app.options("*", cors(corsOptions));

/* ================= MIDDLEWARE ================= */

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use("/public/temp", express.static("public/temp"));
app.use(cookieParser());

app.use(
session({
secret: process.env.SESSION_SECRET || "sessionsecret",
resave: false,
saveUninitialized: false,
cookie: {
secure: process.env.NODE_ENV === "production", // HTTPS only in production
sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
},
})
);

// 🔍 Request logger (very useful for debugging)
app.use((req, res, next) => {
console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
next();
});

/* ================= ROUTES ================= */

// User authentication routes (supports both /api/v1/users/* and /api/auth/* for backward compatibility)
app.use("/api/v1/users", userRouter);
app.use("/api/auth", userRouter);

// Additional auth routes that require a valid token
app.use("/api/auth", authRouter);

app.use("/api/arena", arenaRoutes);
app.use("/api/dashboard/videos", dashboardVideoRoutes);
app.use("/api/rankings", rankingsRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/upload", uploadRoutes);

/* ================= 404 HANDLER ================= */

app.use((req, res) => {
res.status(404).json({
success: false,
message: `Route not found: ${req.originalUrl}`,
});
});

/* ================= ERROR HANDLER ================= */

app.use((err, req, res, next) => {
console.error("🔥 ERROR STACK:", err);

res.status(err.statusCode || 500).json({
success: false,
message: err.message || "Internal Server Error",
});
});

export { app };
