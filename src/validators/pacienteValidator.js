import { ValidationError } from '../errors/ValidationError.js';

const requiredFields = ['nombre', 'apellido', 'tipoDocumento', 'documento', 'fechaNacimiento'];

export const validatePacienteCreation = (body) => {
  const errors = [];

  for (const field of requiredFields) {
    if (!body[field]) {
      errors.push({ field, message: `El campo ${field} es obligatorio.` });
    }
  }

  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    errors.push({ field: 'email', message: 'El email no tiene un formato válido.' });
  }

  if (errors.length > 0) {
    throw new ValidationError('Datos de paciente inválidos', errors);
  }
};

export const validatePacienteUpdate = (body) => {
  const errors = [];

  if (body.tipoDocumento) {
    errors.push({ field: 'tipoDocumento', message: 'El tipo de documento es inmutable y no puede modificarse.' });
  }

  if (body.documento) {
    errors.push({ field: 'documento', message: 'El documento es inmutable y no puede modificarse.' });
  }

  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    errors.push({ field: 'email', message: 'El email no tiene un formato válido.' });
  }

  if (errors.length > 0) {
    throw new ValidationError('Actualización de paciente inválida', errors);
  }
};