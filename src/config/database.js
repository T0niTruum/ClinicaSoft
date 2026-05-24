import dotenv from 'dotenv';

dotenv.config();

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is required in the environment configuration');
}

export const databaseConfig = {
  url: DATABASE_URL,
  dialect: 'postgres',
  logging: false,
};
