import { Especialidad } from '../models/index.js';

export class EspecialidadRepository {
  static async findById(id, options = {}) {
    return Especialidad.findByPk(id, options);
  }
}
