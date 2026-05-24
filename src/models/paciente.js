import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('Paciente', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    fechaNacimiento: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    estadoCivil: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    estadoPaciente: {
      type: DataTypes.ENUM('ACTIVO', 'INACTIVO'),
      allowNull: false,
      defaultValue: 'ACTIVO',
    },
  }, {
    tableName: 'paciente',
  });
};
