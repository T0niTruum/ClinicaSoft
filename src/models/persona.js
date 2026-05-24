import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('Persona', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    apellido: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tipoDocumento: {
      type: DataTypes.ENUM('RC', 'TI', 'CC', 'CE'),
      allowNull: false,
    },
    documento: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { isEmail: true },
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'persona',
  });
};
