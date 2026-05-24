export const flashMiddleware = (req, res, next) => {
  if (!req.session) {
    res.locals.flash = {};
    req.flash = () => {};
    return next();
  }

  res.locals.flash = req.session.flash || {};
  delete req.session.flash;

  req.flash = (type, message) => {
    if (!req.session) return;
    req.session.flash = req.session.flash || {};
    req.session.flash[type] = req.session.flash[type] || [];
    req.session.flash[type].push(message);
  };

  next();
};