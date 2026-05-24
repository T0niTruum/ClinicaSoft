export const requestValidator = (validator) => (req, res, next) => {
  try {
    validator(req.body, req.query, req.params);
    next();
  } catch (error) {
    next(error);
  }
};