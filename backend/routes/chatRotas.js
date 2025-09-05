import express from "express";
import { criarChatController, listarChatsController, obterChatPorIdController } from "../controllers/chatController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, criarChatController);
router.get("/", authMiddleware, listarChatsController);
router.get("/:id", authMiddleware, obterChatPorIdController);

router.options("/", (req, res) => {
  res.setHeader("Allow", "POST, GET");
  res.status(204).send();
});
router.options("/:id", (req, res) => {
  res.setHeader("Allow", "GET");    
res.status(204).send();
});

export default router;
