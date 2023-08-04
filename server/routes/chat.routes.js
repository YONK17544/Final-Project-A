import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { accessChat, addToGroup, createGroupChats, fetchChats, removeFromGroup, renameGroupChat } from "../controllers/chatsControllers.js";


const router = express.Router();

router.post("/", protect, accessChat);
router.get("/all", protect, fetchChats);
router.post("/group", protect, createGroupChats);
router.patch("/rename", protect, renameGroupChat);
router.patch("/groupremove", protect, removeFromGroup);
router.patch("/groupadd", protect, addToGroup);

export default router;
