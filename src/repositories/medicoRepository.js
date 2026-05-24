import { Medico, Especialidad, Persona } from '../models/index.js';

export class MedicoRepository {
  static async findByIdWithEspecialidad(id, options = {}) {
    return Medico.findByPk(id, {
      include: [
        { model: Persona, as: 'persona' },
        { model: Especialidad, as: 'especialidad' },
      ],
      ...options,
    });
  }

  static async findAllWithDetails(options = {}) {
    return Medico.findAll({
      include: [
        { model: Persona, as: 'persona' },
        { model: Especialidad, as: 'especialidad' },
      ],
      ...options,
    });
  }

  static async listAvailable(especialidadId = null, options = {}) {
    const where = { disponibilidad: true };
    if (especialidadId) where.especialidadId = especialidadId;

    return Medico.findAll({
      where,
      include: [
        { model: Persona, as: 'persona' },
        { model: Especialidad, as: 'especialidad' },
      ],
      ...options,
    });
  }
}
