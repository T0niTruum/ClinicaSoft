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
      field: 'fecha_nacimiento',
    },
    estadoCivil: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'estado_civil',
    },
    estadoPaciente: {
      type: DataTypes.ENUM('ACTIVO', 'INACTIVO'),
      allowNull: false,
      defaultValue: 'ACTIVO',
      field: 'estado_paciente',
    },
  }, {
    tableName: 'paciente',
  });
};
