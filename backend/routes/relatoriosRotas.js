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

router.get('/download/:nomeDoArquivo', (req, res) => {
  const nomeDoArquivo = req.params.nomeDoArquivo;
  const caminhoDoArquivo = path.join('pdfs_gerados', nomeDoArquivo);

  if (fs.existsSync(caminhoDoArquivo)) {
    res.setHeader('Content-Disposition', `attachment; filename="${nomeDoArquivo}"`);
    res.sendFile(path.resolve(caminhoDoArquivo));
  } else {
    console.error(`Arquivo PDF não encontrado para download: ${caminhoDoArquivo}`);
    res.status(404).json({ mensagem: 'Arquivo PDF não encontrado.' });
  }
});

router.get('/pdf/:id', authMiddleware, gerarRelatorioPdfPorIdController);
router.get('/tecnicos', authMiddleware, relatorioTecnicosController); 
router.get('/equipamentos', authMiddleware, relatorioEquipamentosController);

router.get('/tecnicos', authMiddleware, relatorioTecnicosController);
router.get('/equipamentos', authMiddleware, relatorioEquipamentosController);

router.get('/recentes', authMiddleware, listarRelatoriosRecentesController);

export default router;