import { EspecialidadRepository } from '../repositories/especialidadRepository.js';

export class EspecialidadService {
  static async listActiveEspecialidades() {
    return EspecialidadRepository.listActive();
  }
}
