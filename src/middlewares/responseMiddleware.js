import { respond } from '../helpers/responseHelper.js';

export const hybridResponder = (req, res, next) => {
  res.respond = (payload) => respond(req, res, payload);
  next();
};