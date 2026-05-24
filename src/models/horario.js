import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('Horario', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    horaInicio: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'hora_inicio',
    },
    horaFin: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'hora_fin',
    },
    disponible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    medicoId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'medico_id',
    },
  }, {
    tableName: 'horario',
  });
};
