import { Op } from 'sequelize';
import { Horario, Cita, Medico, Persona } from '../models/index.js';

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

  static async listUpcomingAvailable(limit = 5, options = {}) {
    return Horario.findAll({
      where: {
        disponible: true,
        fecha: { [Op.gte]: new Date() },
      },
      include: [
        { model: Medico, as: 'medico', include: [{ model: Persona, as: 'persona' }] },
      ],
      order: [['fecha', 'ASC'], ['horaInicio', 'ASC']],
      limit,
      ...options,
    });
  }
}
