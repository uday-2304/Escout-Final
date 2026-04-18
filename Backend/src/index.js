import dotenv from "dotenv"; // forced restart
import connectDB from "./db/index.js";
import { app } from "./app.js";

// 1. ADD THESE TWO IMPORTS
import { createServer } from "http";
import { Server } from "socket.io";

// (Optional) Import your socket handler once you create the file
import { handleSockets } from "./sockets/socketHandler.js"; 

dotenv.config({
    path: './.env'
})

// 2. WRAP EXPRESS APP IN NODE'S HTTP SERVER
const httpServer = createServer(app);

// 3. INITIALIZE SOCKET.IO ON THAT SERVER
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173", 
      "https://escout-esports-scouting-platform.vercel.app",
      "https://escout-esports-scouting-platform-1.onrender.com"
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// 4. PASS THE 'io' OBJECT TO YOUR SOCKET LOGIC (Uncomment when ready)
handleSockets(io);

// 5. CONNECT TO DB AND START THE SERVER
connectDB()
    .then(() => {
        // 🚨 CRITICAL CHANGE: Changed 'app.listen' to 'httpServer.listen'
        const server = httpServer.listen(process.env.PORT || 8000, () => {
            console.log(`⚙️ Server is running at port : ${process.env.PORT || 8000}`);
            console.log("✅ SERVER RESTARTED WITH LATEST CODE (Step Id 228)");
        });
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    });