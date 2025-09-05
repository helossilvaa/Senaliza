import express from "express";
import {
  getChamadosStatusController,
  getChamadosStatusAdminController,
  getRankingTecnicosController,
  getCategoriasChamadosController
} from "../controllers/chamadoController.js";

const router = express.Router();

router.get("/status", getChamadosStatusController);

router.get("/status/admin", getChamadosStatusAdminController);
router.get("/ranking-tecnicos", getRankingTecnicosController);
router.get("/categorias", getCategoriasChamadosController);

export default router;
