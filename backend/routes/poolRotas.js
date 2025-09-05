import express from 'express';
import { obterPoolIdController, listarPoolsController } from "../controllers/poolController.js";
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, listarPoolsController);

router.options('/', (req, res) => {
    res.setHeader('Allow', 'GET, OPTIONS');
    res.status(204).send();
})

router.get('/:id', authMiddleware, obterPoolIdController);

router.options('/:id', (req, res) => {
    res.setHeader('Allow', 'GET, OPTIONS');
    res.status(204).send();
});

export default router;
