import { Sequelize } from 'sequelize';
import { sequelize } from '../db/sequelize.js';
import { PacienteRepository } from '../repositories/pacienteRepository.js';
import { Horario } from '../models/index.js';
import { CitaRepository } from '../repositories/citaRepository.js';
import { ValidationError, NotFoundError, ConflictError } from '../errors/index.js';

const ESTADO_UI = {
  ASIGNADO: { label: 'Programada', tone: 'scheduled' },
  PENDIENTE: { label: 'Programada', tone: 'scheduled' },
  FINALIZADO: { label: 'Completada', tone: 'completed' },
  CANCELADO: { label: 'Cancelada', tone: 'cancelled' },
};

export class CitaService {
  static estadoMeta(estado) {
    return ESTADO_UI[estado] || { label: estado, tone: 'scheduled' };
  }

  static calcularEdad(fechaNacimiento) {
    if (!fechaNacimiento) return null;
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad -= 1;
    return edad;
  }

  static iniciales(nombre = '', apellido = '') {
    return `${(nombre[0] || '').toUpperCase()}${(apellido[0] || '').toUpperCase()}`;
  }

  static mapCitaHistorial(cita) {
    const plain = cita.get ? cita.get({ plain: true }) : cita;
    const medicoPersona = plain.medico?.persona;
    const meta = this.estadoMeta(plain.estado);

    return {
      id: plain.id,
      motivo: plain.motivo,
      estado: plain.estado,
      estadoLabel: meta.label,
      estadoTone: meta.tone,
      fechaHora: plain.horario?.horaInicio,
      horaFin: plain.horario?.horaFin,
      especialidad: plain.medico?.especialidad?.nombre || '—',
      medico: {
        id: plain.medicoId,
        nombre: medicoPersona ? `Dr. ${medicoPersona.nombre} ${medicoPersona.apellido}` : '—',
        iniciales: this.iniciales(medicoPersona?.nombre, medicoPersona?.apellido),
      },
      puedeModificar: plain.estado === 'ASIGNADO' || plain.estado === 'PENDIENTE',
      puedeDescargar: plain.estado === 'FINALIZADO',
    };
  }

  static mapPacienteResumen(paciente) {
    if (!paciente) return null;
    const plain = paciente.get ? paciente.get({ plain: true }) : paciente;
    const persona = plain.persona;
    if (!persona) return null;

    return {
      id: plain.id,
      nombre: `${persona.nombre} ${persona.apellido}`,
      tipoDocumento: persona.tipoDocumento,
      documento: persona.documento,
      email: persona.email,
      telefono: persona.telefono,
      fechaNacimiento: plain.fechaNacimiento,
      edad: this.calcularEdad(plain.fechaNacimiento),
      estadoPaciente: plain.estadoPaciente,
      iniciales: this.iniciales(persona.nombre, persona.apellido),
    };
  }

  static async obtenerPacienteResumen(pacienteId) {
    const paciente = await PacienteRepository.findById(pacienteId);
    if (!paciente) throw new NotFoundError('Paciente no encontrado.');
    return this.mapPacienteResumen(paciente);
  }

  static async listarHistorial(filters = {}, pagination = {}) {
    if (!filters.pacienteId) {
      throw new ValidationError('Debe seleccionar un paciente para consultar el historial.');
    }

    const paciente = await PacienteRepository.findByIdWithPersona(filters.pacienteId);
    if (!paciente) throw new NotFoundError('Paciente no encontrado.');

    const result = await CitaRepository.listHistorial(filters, pagination);

    return {
      paciente: this.mapPacienteResumen(paciente),
      items: result.rows.map((cita) => this.mapCitaHistorial(cita)),
      total: result.count,
      page: pagination.page || 1,
      pageSize: pagination.pageSize || 10,
    };
  }

  static async actualizarEstado(citaId, estado) {
    const permitidos = ['ASIGNADO', 'PENDIENTE', 'CANCELADO', 'FINALIZADO'];
    if (!permitidos.includes(estado)) {
      throw new ValidationError('Estado de cita no válido.');
    }

    const cita = await CitaRepository.findById(citaId);
    if (!cita) throw new NotFoundError('Cita no encontrada.');

    if (estado === 'CANCELADO' && !['ASIGNADO', 'PENDIENTE'].includes(cita.estado)) {
      throw new ValidationError('Solo se pueden cancelar citas programadas.');
    }

    if (estado === 'FINALIZADO' && cita.estado !== 'ASIGNADO') {
      throw new ValidationError('Solo se pueden completar citas programadas.');
    }

    const updated = await sequelize.transaction(async (transaction) => {
      return CitaRepository.updateEstado(citaId, estado, { transaction });
    });

    return this.mapCitaHistorial(updated);
  }

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
