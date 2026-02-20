const validate = (schema, source = 'body') => (req, res, next) => {
  const payload = req[source];
  const result = schema.safeParse(payload);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => {
      const path = issue.path.join('.') || source;
      return `${path}: ${issue.message}`;
    });

    res.status(400);
    return next(new Error(`Validation failed - ${errors.join('; ')}`));
  }

  req[source] = result.data;
  return next();
};

module.exports = {
  validate
};
