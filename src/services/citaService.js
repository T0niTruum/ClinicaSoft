import { Sequelize } from 'sequelize';
import { sequelize } from '../db/sequelize.js';
import { PacienteRepository } from '../repositories/pacienteRepository.js';
import { Horario } from '../models/index.js';
import { CitaRepository } from '../repositories/citaRepository.js';
import { ValidationError, NotFoundError, ConflictError } from '../errors/index.js';

export class CitaService {
  static async agendarCita({ tipoDocumento, documento, medicoId, horarioId, motivo }) {
    const paciente = await PacienteRepository.findByDocumentoAndPaciente(tipoDocumento, documento);
    if (!paciente) {
      throw new NotFoundError('Paciente no registrado en el sistema');
    }

    if (paciente.paciente.estadoPaciente !== 'ACTIVO') {
      throw new ValidationError('El paciente se encuentra inactivo en el sistema y no está autorizado para agendar citas');
    }

    return sequelize.transaction(
      { isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.REPEATABLE_READ },
      async (transaction) => {
        const horario = await Horario.findByPk(horarioId, {
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (!horario) {
          throw new NotFoundError('El horario seleccionado no existe.');
        }

        if (!horario.disponible) {
          throw new ConflictError('El horario seleccionado ya no se encuentra disponible');
        }

        if (horario.medicoId !== medicoId) {
          throw new ValidationError('El horario no corresponde al médico seleccionado.');
        }

        if (new Date(horario.horaInicio) <= new Date()) {
          throw new ValidationError('No se pueden agendar citas en fechas pasadas.');
        }

        horario.disponible = false;
        await horario.save({ transaction });

        const cita = await CitaRepository.create(
          {
            pacienteId: paciente.paciente.id,
            medicoId,
            horarioId,
            motivo,
            estado: 'ASIGNADO',
          },
          { transaction }
        );

        return cita;
      }
    );
  }
}
