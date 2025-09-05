import express from 'express';
import path from 'path';
import { listarRelatoriosController, buscarRelatoriosController, listarPdfsGeradosController, relatorioTecnicosController, relatorioEquipamentosController} from '../controllers/relatorioController.js';
import { gerarRelatorioPdfPorIdController } from '../controllers/relatorioPDFcontroller.js';
import authMiddleware from '../middlewares/authMiddleware.js'; 

const router = express.Router();

router.get('/', authMiddleware, listarRelatoriosController);

router.get('/buscar', authMiddleware, buscarRelatoriosController);

router.get('/pdfs', authMiddleware, listarPdfsGeradosController);

router.get('/pdfs/:nomeDoArquivo', (req, res) => {
  const nomeDoArquivo = req.params.nomeDoArquivo;
  const caminhoDoArquivo = path.join('pdfs_gerados', nomeDoArquivo);
  res.sendFile(path.resolve(caminhoDoArquivo));
});

router.get('/pdf/:id', authMiddleware, gerarRelatorioPdfPorIdController);
router.get('/tecnicos', authMiddleware, relatorioTecnicosController); 
router.get('/equipamentos', authMiddleware, relatorioEquipamentosController);

export default router;
