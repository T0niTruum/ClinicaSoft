import { Paciente, Persona, Cita } from '../models/index.js';

export class PacienteRepository {
  static async findById(id, options = {}) {
    return Paciente.findByPk(id, {
      include: [{ model: Persona, as: 'persona' }, { model: Cita, as: 'citas' }],
      ...options,
    });
  }

  static async findByIdWithPersona(id, options = {}) {
    return this.findById(id, options);
  }

  static async updateEstadoPaciente(id, estado, options = {}) {
    const paciente = await Paciente.findByPk(id, { ...options });
    if (!paciente) return null;
    paciente.estadoPaciente = estado;
    return paciente.save(options);
  }
}
