import { Especialidad, Medico } from '../models/index.js';

export class EspecialidadRepository {
  static async findById(id, options = {}) {
    return Especialidad.findByPk(id, options);
  }

  static async listActive(options = {}) {
    return Especialidad.findAll({
      where: { disponibilidad: true },
      include: [{ model: Medico, as: 'medicos', where: { disponibilidad: true }, required: false }],
      order: [['nombre', 'ASC']],
      ...options,
    });
  }
}
