import express from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import {
  listarPacientes,
  renderCrearPaciente,
  crearPaciente,
  renderEditarPaciente,
  editarPaciente,
  inactivarPacientePOST,
} from '../controllers/pacienteController.js';

const router = express.Router();

router.get('/', asyncHandler(listarPacientes));
router.get('/nuevo', asyncHandler(renderCrearPaciente));
router.post('/', asyncHandler(crearPaciente));
router.get('/:id/editar', asyncHandler(renderEditarPaciente));
router.post('/:id/editar', asyncHandler(editarPaciente));
router.post('/:id/inactivar', asyncHandler(inactivarPacientePOST));

export default router;
