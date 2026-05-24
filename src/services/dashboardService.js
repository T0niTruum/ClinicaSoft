import { Paciente, Medico, Cita } from '../models/index.js';
import { HorarioRepository } from '../repositories/horarioRepository.js';

export class DashboardService {
  static async getDashboardData() {
    const [pacientesActivos, medicosDisponibles, citasPendientes, proximosHorarios] = await Promise.all([
      Paciente.count({ where: { estadoPaciente: 'ACTIVO' } }),
      Medico.count({ where: { disponibilidad: true } }),
      Cita.count({ where: { estado: 'PENDIENTE' } }),
      HorarioRepository.listUpcomingAvailable(5),
    ]);

    return {
      pacientesActivos,
      medicosDisponibles,
      citasPendientes,
      proximosHorarios,
    };
  }
}
