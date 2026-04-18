import express from "express";
import { allMessages, sendMessage, editMessage, addReaction } from "../controllers/messageController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);

router.get("/:chatId", allMessages);
router.post("/", sendMessage);
router.put("/edit", editMessage);
router.put("/reaction", addReaction);

export default router;
