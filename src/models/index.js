import { sequelize } from '../db/sequelize.js';
import definePersona from './persona.js';
import definePaciente from './paciente.js';
import defineEspecialidad from './especialidad.js';
import defineMedico from './medico.js';
import defineHorario from './horario.js';
import defineCita from './cita.js';

const Persona = definePersona(sequelize);
const Paciente = definePaciente(sequelize);
const Especialidad = defineEspecialidad(sequelize);
const Medico = defineMedico(sequelize);
const Horario = defineHorario(sequelize);
const Cita = defineCita(sequelize);

Persona.hasOne(Paciente, { foreignKey: 'id', as: 'paciente' });
Paciente.belongsTo(Persona, { foreignKey: 'id', as: 'persona' });

Persona.hasOne(Medico, { foreignKey: 'id', as: 'medico' });
Medico.belongsTo(Persona, { foreignKey: 'id', as: 'persona' });

Especialidad.hasMany(Medico, { foreignKey: 'especialidadId', as: 'medicos' });
Medico.belongsTo(Especialidad, { foreignKey: 'especialidadId', as: 'especialidad' });

Medico.hasMany(Horario, { foreignKey: 'medicoId', as: 'horarios' });
Horario.belongsTo(Medico, { foreignKey: 'medicoId', as: 'medico' });

Paciente.hasMany(Cita, { foreignKey: 'pacienteId', as: 'citas' });
Cita.belongsTo(Paciente, { foreignKey: 'pacienteId', as: 'paciente' });

Medico.hasMany(Cita, { foreignKey: 'medicoId', as: 'citas' });
Cita.belongsTo(Medico, { foreignKey: 'medicoId', as: 'medico' });

Horario.hasOne(Cita, { foreignKey: 'horarioId', as: 'cita' });
Cita.belongsTo(Horario, { foreignKey: 'horarioId', as: 'horario' });

export {
  sequelize,
  Persona,
  Paciente,
  Especialidad,
  Medico,
  Horario,
  Cita,
};
