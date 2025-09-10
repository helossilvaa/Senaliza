import express from 'express';
import path from 'path';
import { listarRelatoriosController, buscarRelatoriosController, listarPdfsGeradosController, relatorioTecnicosController, relatorioEquipamentosController, listarRelatoriosRecentesController} from '../controllers/relatorioController.js';
import { gerarRelatorioPdfPorIdController } from '../controllers/relatorioPDFcontroller.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import fs from 'fs';

const router = express.Router();

router.get('/', authMiddleware, listarRelatoriosController);

router.get('/buscar', authMiddleware, buscarRelatoriosController);

router.get('/pdfs', authMiddleware, listarPdfsGeradosController);

router.get('/pdfs/:nomeArquivo', (req, res) => {
  const { nomeArquivo } = req.params;
  const filePath = path.join(process.cwd(), 'pdfs_gerados', nomeArquivo);

  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send('Arquivo não encontrado');
    }
  });
});


router.get('/pdf/:id', authMiddleware, gerarRelatorioPdfPorIdController);
router.get('/tecnicos', authMiddleware, relatorioTecnicosController); 
router.get('/equipamentos', authMiddleware, relatorioEquipamentosController);

router.get('/tecnicos', authMiddleware, relatorioTecnicosController);
router.get('/equipamentos', authMiddleware, relatorioEquipamentosController);

router.get('/recentes', authMiddleware, listarRelatoriosRecentesController);

export default router;