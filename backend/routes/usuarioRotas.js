import express from 'express';
import { 
  criarUsuarioController,
  listarUsuariosController,
  obterUsuarioIdController,
  obterUsuarioLogadoController,
  listarTecnicosController,
  listarTecnicosComPoolsController,
  mudarStatusTecnicoController
} from '../controllers/usuarioController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
 
const router = express.Router();
 

router.put('/tecnicos/:id/status', authMiddleware, mudarStatusTecnicoController);
router.options('/tecnicos/:id/status', (req, res) => {
    res.setHeader('Allow', 'PUT, OPTIONS');
    res.status(204).send();
});


router.get('/tecnicosPools', authMiddleware, listarTecnicosComPoolsController);
router.get('/tecnicos', authMiddleware, listarTecnicosController);
router.get('/meuperfil', authMiddleware, obterUsuarioLogadoController);
 

router.get('/:id', authMiddleware, obterUsuarioIdController);
router.options('/:id', (req, res) => {
    res.setHeader('Allow', 'GET, OPTIONS');
    res.status(204).send();
});

router.post('/', authMiddleware, criarUsuarioController);
router.get('/', authMiddleware, listarUsuariosController);
router.options('/', (req, res) => {
    res.setHeader('Allow', 'POST, GET, OPTIONS');
    res.status(204).send();
});
 
export default router;