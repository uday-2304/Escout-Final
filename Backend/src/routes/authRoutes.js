import { Router } from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const router = Router();

// Example: protected dashboard route
router.get("/", verifyToken, (req, res) => {
  res.json(new ApiResponse(200, { user: req.user }, "Welcome to your Dashboard"));
});

// Example: protected arena hub route
router.get("/arena", verifyToken, (req, res) => {
  res.json(new ApiResponse(200, { user: req.user }, "Welcome to the Arena Hub"));
});

export default router;
