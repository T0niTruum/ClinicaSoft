import { Op } from 'sequelize';
import { Cita, Paciente, Medico, Horario, Persona, Especialidad } from '../models/index.js';

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
        { model: Paciente, as: 'paciente', include: [{ model: Persona, as: 'persona' }] },
        { model: Medico, as: 'medico', include: [{ model: Persona, as: 'persona' }, { model: Especialidad, as: 'especialidad' }] },
        { model: Horario, as: 'horario' },
      ],
      ...options,
    });
  }

  static async updateEstado(id, estado, options = {}) {
    const cita = await Cita.findByPk(id, {
      include: [{ model: Horario, as: 'horario' }],
      ...options,
    });
    if (!cita) return null;

    cita.estado = estado;
    await cita.save(options);

    if (estado === 'CANCELADO' && cita.horario) {
      cita.horario.disponible = true;
      await cita.horario.save(options);
    }

    return cita;
  }

  static async listHistorial(filters = {}, pagination = {}, options = {}) {
    const { pacienteId, especialidadId, medicoId, fechaDesde, fechaHasta, estado } = filters;
    const { page = 1, pageSize = 10 } = pagination;

    const where = {};
    if (pacienteId) where.pacienteId = pacienteId;
    if (medicoId) where.medicoId = medicoId;
    if (estado) where.estado = estado;

    const horarioWhere = {};
    if (fechaDesde || fechaHasta) {
      horarioWhere.horaInicio = {};
      if (fechaDesde) horarioWhere.horaInicio[Op.gte] = new Date(`${fechaDesde}T00:00:00`);
      if (fechaHasta) horarioWhere.horaInicio[Op.lte] = new Date(`${fechaHasta}T23:59:59`);
    }

    const medicoInclude = {
      model: Medico,
      as: 'medico',
      include: [
        { model: Persona, as: 'persona' },
        { model: Especialidad, as: 'especialidad' },
      ],
    };
    if (especialidadId) {
      medicoInclude.where = { especialidadId };
      medicoInclude.required = true;
    }

    const horarioInclude = {
      model: Horario,
      as: 'horario',
      required: true,
    };
    if (Object.keys(horarioWhere).length > 0) {
      horarioInclude.where = horarioWhere;
    }

    return Cita.findAndCountAll({
      where,
      include: [
        horarioInclude,
        medicoInclude,
        {
          model: Paciente,
          as: 'paciente',
          include: [{ model: Persona, as: 'persona' }],
        },
      ],
      order: [[{ model: Horario, as: 'horario' }, 'horaInicio', 'DESC']],
      offset: (page - 1) * pageSize,
      limit: pageSize,
      distinct: true,
      ...options,
    });
  }
}
