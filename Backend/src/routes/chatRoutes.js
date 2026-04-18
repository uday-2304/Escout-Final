import express from "express";
import { fetchChats, createGroupChat, accessChat, addToGroup, removeFromGroup, deleteChat } from "../controllers/chatController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);

router.post("/", accessChat);
router.get("/", fetchChats);
router.post("/group", createGroupChat);
router.put("/add", addToGroup);
router.put("/remove", removeFromGroup);
router.delete("/:chatId", deleteChat);

export default router;
