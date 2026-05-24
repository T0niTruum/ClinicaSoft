import { Cita, Paciente, Medico, Horario } from '../models/index.js';

export class CitaRepository {
  static async create(citaData, options = {}) {
    return Cita.create(citaData, options);
  }

  static async findByHorarioId(horarioId, options = {}) {
    return Cita.findOne({ where: { horarioId }, ...options });
  }

  static async findById(id, options = {}) {
    return Cita.findByPk(id, {
      include: [
        { model: Paciente, as: 'paciente' },
        { model: Medico, as: 'medico' },
        { model: Horario, as: 'horario' },
      ],
      ...options,
    });
  }
}
