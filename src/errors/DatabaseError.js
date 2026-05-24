import { AppError } from './AppError.js';

export class DatabaseError extends AppError {
  constructor(message) {
    super(message, 500, 'DATABASE_ERROR');
  }
}
