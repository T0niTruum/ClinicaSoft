import { AppError } from '../errors/AppError.js';

export const errorHandler = (err, req, res, next) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const payload = {
    success: false,
    message: err.message || 'Ha ocurrido un error inesperado',
    errors: err.errors || [],
  };

  if (req.xhr || req.query.format === 'json' || req.get('Accept')?.includes('application/json')) {
    return res.status(statusCode).json(payload);
  }

  return res.status(statusCode).render('error', {
    error: payload,
    flash: res.locals.flash,
  });
};