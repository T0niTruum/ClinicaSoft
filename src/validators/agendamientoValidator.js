import { ValidationError } from '../errors/ValidationError.js';

export const validateAgendamiento = (body) => {
  const errors = [];

  if (!body.tipoDocumento) {
    errors.push({ field: 'tipoDocumento', message: 'El tipo de documento es obligatorio.' });
  }
  if (!body.documento) {
    errors.push({ field: 'documento', message: 'El documento es obligatorio.' });
  }
  if (!body.medicoId) {
    errors.push({ field: 'medicoId', message: 'Debe seleccionar un médico.' });
  }
  if (!body.horarioId) {
    errors.push({ field: 'horarioId', message: 'Debe seleccionar un horario.' });
  }
  if (!body.motivo) {
    errors.push({ field: 'motivo', message: 'Debe describir el motivo de la consulta.' });
  }

  if (errors.length > 0) {
    throw new ValidationError('Datos de agendamiento inválidos', errors);
  }
};