import express from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { PacienteService } from '../services/pacienteService.js';
import { validatePacienteCreation, validatePacienteUpdate } from '../validators/pacienteValidator.js';
import { ValidationError } from '../errors/index.js';

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 15;
  const filters = {
    estadoPaciente: req.query.estado || undefined,
    documento: req.query.documento || undefined,
  };

  const pacientes = await PacienteService.listPacientes(filters, { page, pageSize });

  return res.json({
    success: true,
    message: 'Listado de pacientes',
    data: {
      items: pacientes.rows,
      total: pacientes.count,
      page,
      pageSize,
    },
  });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const paciente = await PacienteService.findPacienteById(req.params.id);

  if (!paciente) {
    return res.status(404).json({ success: false, message: 'Paciente no encontrado' });
  }

  const data = paciente.get ? paciente.get({ plain: true }) : paciente;
  return res.json({ success: true, message: 'Paciente cargado', data });
}));

router.post('/', asyncHandler(async (req, res) => {
  try {
    validatePacienteCreation(req.body);
    const paciente = await PacienteService.createPaciente(req.body);
    return res.status(201).json({ success: true, message: 'Paciente creado', data: paciente });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(error.statusCode || 400).json({ success: false, message: error.message, errors: error.errors });
    }
    throw error;
  }
}));

router.put('/:id', asyncHandler(async (req, res) => {
  try {
    validatePacienteUpdate(req.body);
    const paciente = await PacienteService.updatePaciente(req.params.id, req.body);
    return res.json({ success: true, message: 'Paciente actualizado', data: paciente });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(error.statusCode || 400).json({ success: false, message: error.message, errors: error.errors });
    }
    throw error;
  }
}));

router.patch('/:id/inactivar', asyncHandler(async (req, res) => {
  const paciente = await PacienteService.inactivatePaciente(req.params.id);
  return res.json({ success: true, message: 'Paciente inactivado', data: paciente });
}));

export default router;
