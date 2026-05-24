import { MedicoRepository } from '../repositories/medicoRepository.js';

export class MedicoService {
  static async listMedicosDisponibles(especialidadId = null) {
    return MedicoRepository.listAvailable(especialidadId);
  }
}
