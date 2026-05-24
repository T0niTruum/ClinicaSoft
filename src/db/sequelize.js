import { Sequelize } from 'sequelize';
import { databaseConfig } from '../config/database.js';

export const sequelize = new Sequelize(databaseConfig.url, {
  dialect: databaseConfig.dialect,
  logging: databaseConfig.logging,
  define: {
    underscored: true,
    freezeTableName: true,
    timestamps: false,
  },
});
