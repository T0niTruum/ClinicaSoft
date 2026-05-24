import express from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import {
  buscarPacienteHandler,
  listarEspecialidadesYMedicosHandler,
  confirmarAgendamientoHandler,
} from '../controllers/agendamientoController.js';

const router = express.Router();

router.post('/buscar', asyncHandler(buscarPacienteHandler));
router.get('/especialidades', asyncHandler(listarEspecialidadesYMedicosHandler));
router.post('/confirmar', asyncHandler(confirmarAgendamientoHandler));

export default router;
