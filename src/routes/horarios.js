import express from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { HorarioRepository } from '../repositories/horarioRepository.js';
import { ValidationError } from '../errors/index.js';

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const { medicoId, fecha } = req.query;

  if (!medicoId) {
    throw new ValidationError('El médico es obligatorio para consultar horarios.');
  }
  if (!fecha) {
    throw new ValidationError('La fecha es obligatoria para consultar horarios.');
  }

  const horarios = await HorarioRepository.listDisponiblesByMedicoAndFecha(medicoId, fecha);
  const data = horarios.map((h) => {
    const plain = h.get({ plain: true });
    return {
      id: plain.id,
      fecha: plain.fecha,
      horaInicio: plain.horaInicio,
      horaFin: plain.horaFin,
      disponible: plain.disponible,
      medicoId: plain.medicoId,
    };
  });

  return res.json({
    success: true,
    message: 'Horarios disponibles',
    data,
  });
}));

export default router;
