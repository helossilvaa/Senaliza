import express from 'express';
import { criarAvaliacaoController } from '../controllers/avaliacoesController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/chamados/:id/avaliar', authMiddleware, criarAvaliacaoController);

export default router;