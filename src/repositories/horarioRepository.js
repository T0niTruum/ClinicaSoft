import { Horario, Cita } from '../models/index.js';

export class HorarioRepository {
  static async findByIdWithLock(id, options = {}) {
    return Horario.findByPk(id, {
      include: [{ model: Cita, as: 'cita' }],
      ...options,
    });
  }

  static async findById(id, options = {}) {
    return Horario.findByPk(id, { ...options });
  }
}
