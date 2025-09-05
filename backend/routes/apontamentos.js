import express from 'express';
import { criarApontamentoController, listarApontamentosController } from '../controllers/apontamentosController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import authVerifyRole from '../middlewares/authVerifyRole.js';

const router = express.Router();

router.post('/apontamentos', authMiddleware, authVerifyRole(['tecnico','usuario_comum']), criarApontamentoController);

router.get('/apontamentos/:chamadoId', authMiddleware, listarApontamentosController);

export default router;
