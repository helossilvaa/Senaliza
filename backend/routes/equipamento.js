import express from 'express';
import { criarEquipamentoController, listarEquipamentosController, atualizarEquipamentoController, deletarEquipamentoController, obterEquipamentoPorPatrimonioController } from '../controllers/equipamentoController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, criarEquipamentoController);
router.get('/', authMiddleware, listarEquipamentosController);
router.get('/:patrimonio', authMiddleware, obterEquipamentoPorPatrimonioController);
router.put('/:patrimonio', authMiddleware, atualizarEquipamentoController);
router.delete('/:patrimonio', authMiddleware, deletarEquipamentoController);

router.options('/', (req, res) => {
    res.setHeader('Allow', 'POST, GET');
    res.status(204).send();
});

router.options('/:patrimonio', (req, res) => {
    res.setHeader('Allow', 'GET, PUT, DELETE');
    res.status(204).send();
});

export default router;