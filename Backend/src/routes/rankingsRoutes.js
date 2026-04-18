import express from "express";
import { getPlatformRankings } from "../controllers/rankingsController.js";

const router = express.Router();

router.get("/platform", getPlatformRankings);

export default router;
