import { sequelize } from '../db/sequelize.js';
import { PacienteRepository } from '../repositories/pacienteRepository.js';
import { ConflictError, NotFoundError } from '../errors/index.js';

export class PacienteService {
  static async findPacientePorDocumento(tipoDocumento, documento) {
    const persona = await PacienteRepository.findByDocumentoAndPaciente(tipoDocumento, documento);
    return persona;
  }

  static async listPacientes(filters = {}, pagination = {}) {
    return PacienteRepository.list(filters, pagination);
  }

  static async findPacienteById(id) {
    return PacienteRepository.findByIdWithPersona(id);
  }

  static async createPaciente(payload) {
    const existing = await PacienteRepository.findByDocumento(payload.tipoDocumento, payload.documento);
    if (existing && existing.paciente) {
      throw new ConflictError('Ya existe un paciente con ese tipo de documento y número de documento.');
    }

    return sequelize.transaction(async (transaction) => {
      const { persona, paciente } = await PacienteRepository.createPaciente(
        {
          nombre: payload.nombre,
          apellido: payload.apellido,
          tipoDocumento: payload.tipoDocumento,
          documento: payload.documento,
          email: payload.email,
          telefono: payload.telefono,
        },
        {
          fechaNacimiento: payload.fechaNacimiento,
          estadoCivil: payload.estadoCivil,
          estadoPaciente: 'ACTIVO',
        },
        { transaction }
      );

      return { persona, paciente };
    });
  }

  static async updatePaciente(id, payload) {
    const existing = await PacienteRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Paciente no encontrado.');
    }

    return sequelize.transaction(async (transaction) => {
      const personaValues = {
        email: payload.email,
        telefono: payload.telefono,
      };
      const pacienteValues = {
        estadoCivil: payload.estadoCivil,
      };

      return PacienteRepository.updatePacienteAttributes(id, personaValues, pacienteValues, { transaction });
    });
  }

  static async inactivatePaciente(id) {
    const existing = await PacienteRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Paciente no encontrado.');
    }

    return PacienteRepository.updateEstadoPaciente(id, 'INACTIVO');
  }
}
