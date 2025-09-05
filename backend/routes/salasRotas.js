import express from 'express';
import { atualizarSalaController, obterSalaIdController, criarSalaController, deletarSalaController, listarSalasController } from '../controllers/salaController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, criarSalaController);

router.get('/', authMiddleware, listarSalasController);

router.get('/:id', authMiddleware, obterSalaIdController);

router.put('/:id', authMiddleware, atualizarSalaController);

router.delete('/:id', authMiddleware, deletarSalaController);

router.options('/', (req, res) => {
    res.setHeader('Allow', 'GET, POST, OPTIONS');
    res.status(204).send();
});

router.options('/:id', (req, res) => {
    res.setHeader('Allow', 'PUT, DELETE, GET, OPTIONS');
    res.status(204).send();

});

export default router;
