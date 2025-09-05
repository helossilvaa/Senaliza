import express from 'express';
import { criarTarefasController, listarTarefasController, atualizarTarefaController, deletarTarefaController } from '../controllers/tarefasController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, criarTarefasController);
router.get('/', authMiddleware, listarTarefasController);
router.put('/:id', authMiddleware, atualizarTarefaController);
router.delete('/:id', authMiddleware, deletarTarefaController);

router.options('/', (req, res) => {
    res.setHeader('Allow', 'GET, POST, OPTIONS');
    res.status(204).send();
});
router.options('/:id', (req, res) => {
    res.setHeader('Allow', 'PUT, DELETE, GET, OPTIONS');
    res.status(204).send();
});

export default router;