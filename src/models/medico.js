import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('Medico', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    tarjetaProfesional: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    disponibilidad: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    especialidadId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'especialidad_id',
    },
    horaInicio: {
      type: DataTypes.TIME,
      allowNull: true,
      field: 'hora_inicio',
    },
    horaFin: {
      type: DataTypes.TIME,
      allowNull: true,
      field: 'hora_fin',
    },
  }, {
    tableName: 'medico',
  });
};
