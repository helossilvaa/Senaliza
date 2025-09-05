import express from 'express';
import {
  criarMensagemController,
  listarMensagensController,
  obterMensagemPorIdController
} from '../controllers/chatMensagens.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, criarMensagemController);
router.get('/:chatId', authMiddleware, listarMensagensController);
router.get('/mensagem/:id', authMiddleware, obterMensagemPorIdController);

router.options('/', (req, res) => {
  res.setHeader('Allow', 'POST, GET');
  res.status(204).send();
}); 
router.options('/:chatId', (req, res) => {
  res.setHeader('Allow', 'GET');
  res.status(204).send();
});
router.options('/mensagem/:id', (req, res) => {
  res.setHeader('Allow', 'GET');
  res.status(204).send();
});

export default router;
