import express from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import {
  listarHistorialCitasHandler,
  listarFiltrosCitasHandler,
  actualizarEstadoCitaHandler,
} from '../controllers/citaController.js';

const router = express.Router();

router.get('/filtros', asyncHandler(listarFiltrosCitasHandler));
router.get('/historial', asyncHandler(listarHistorialCitasHandler));
router.patch('/:id/estado', asyncHandler(actualizarEstadoCitaHandler));

export default router;
