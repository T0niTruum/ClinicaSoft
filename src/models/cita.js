import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('Cita', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    pacienteId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'paciente_id',
    },
    medicoId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'medico_id',
    },
    horarioId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'horario_id',
      unique: true,
    },
    motivo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    estado: {
      type: DataTypes.ENUM('PENDIENTE', 'ASIGNADO', 'CANCELADO', 'FINALIZADO'),
      allowNull: false,
      defaultValue: 'PENDIENTE',
    },
    fechaCreacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'fecha_creacion',
    },
  }, {
    tableName: 'cita',
  });
};
