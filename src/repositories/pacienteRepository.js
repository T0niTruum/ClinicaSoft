import { Op } from 'sequelize';
import { Paciente, Persona, Cita } from '../models/index.js';

export class PacienteRepository {
  static async findById(id, options = {}) {
    return Paciente.findByPk(id, {
      include: [{ model: Persona, as: 'persona' }, { model: Cita, as: 'citas' }],
      ...options,
    });
  }

  static async findByDocumento(tipoDocumento, documento, options = {}) {
    return Persona.findOne({
      where: { tipoDocumento, documento },
      include: [{ model: Paciente, as: 'paciente' }],
      ...options,
    });
  }

  static async findByDocumentoAndPaciente(tipoDocumento, documento, options = {}) {
    const persona = await this.findByDocumento(tipoDocumento, documento, options);
    if (!persona || !persona.paciente) return null;
    return persona;
  }

  static async list(filters = {}, pagination = {}, options = {}) {
    const { estadoPaciente, documento } = filters;
    const { page = 1, pageSize = 15 } = pagination;

    const where = {};
    const personaWhere = {};

    if (estadoPaciente) {
      where.estadoPaciente = estadoPaciente;
    }

    if (documento) {
      personaWhere.documento = { [Op.iLike]: `%${documento}%` };
    }

    return Paciente.findAndCountAll({
      where,
      include: [{ model: Persona, as: 'persona', where: personaWhere }],
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [[{ model: Persona, as: 'persona' }, 'apellido', 'ASC'], ['id', 'ASC']],
      ...options,
    });
  }

  static async createPaciente(personaData, pacienteData, options = {}) {
    const persona = await Persona.create(personaData, options);
    const paciente = await Paciente.create({ id: persona.id, ...pacienteData }, options);
    return { persona, paciente };
  }

  static async updatePacienteAttributes(id, personaValues = {}, pacienteValues = {}, options = {}) {
    const paciente = await Paciente.findByPk(id, {
      include: [{ model: Persona, as: 'persona' }],
      ...options,
    });
    if (!paciente) return null;

    if (Object.keys(personaValues).length > 0) {
      await paciente.persona.update(personaValues, options);
    }
    if (Object.keys(pacienteValues).length > 0) {
      await paciente.update(pacienteValues, options);
    }
    return paciente;
  }

  static async updateEstadoPaciente(id, estado, options = {}) {
    const paciente = await Paciente.findByPk(id, { ...options });
    if (!paciente) return null;
    paciente.estadoPaciente = estado;
    return paciente.save(options);
  }
}
