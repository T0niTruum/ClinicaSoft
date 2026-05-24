export const buildJsonResponse = ({ success = true, message = '', data = null, errors = [] } = {}) => ({
  success,
  message,
  data,
  errors,
});

export const respond = (req, res, { success = true, message = '', data = null, errors = [], view = null, locals = {}, status = 200 } = {}) => {
  const shouldReturnJson = req.xhr || req.query.format === 'json' || req.get('Accept')?.includes('application/json');

  if (shouldReturnJson) {
    return res.status(status).json(buildJsonResponse({ success, message, data, errors }));
  }

  if (view) {
    return res.status(status).render(view, {
      ...locals,
      flash: res.locals.flash,
      success,
      message,
      data,
      errors,
    });
  }

  return res.status(status).json(buildJsonResponse({ success, message, data, errors }));
};