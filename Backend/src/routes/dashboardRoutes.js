import express from "express";
import { upload } from "../middlewares/upload.js";
// Ensure you have this middleware correctly imported
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  addVideo,
  getDashboardVideos,
  toggleLike,
  addComment,
  getComments,
  deleteVideo,
  incrementView
} from "../controllers/VideoController.js";

// DEBUG: Verify router is loaded
console.log("Loading dashboardRoutes...");

const router = express.Router();

// DEBUG: Log requests hitting this router
router.use((req, res, next) => {
  console.log(`[DASHBOARD-ROUTE] ${req.method} ${req.url}`);
  next();
});

// 1. PROTECT ALL ROUTES: This adds req.user to every request below
router.use(verifyToken);

// 2. GET USER VIDEOS: Calls the function that filters by req.user._id
router.get("/", getDashboardVideos);

// 3. UPLOAD VIDEO
router.post(
  "/add-video",
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  addVideo
);

// 4. INTERACTIONS
router.put("/:id/like", toggleLike);
router.post("/:id/comment", addComment);
router.get("/:id/comments", getComments);
router.delete("/:id", deleteVideo);
router.put("/:id/view", incrementView);

export default router;