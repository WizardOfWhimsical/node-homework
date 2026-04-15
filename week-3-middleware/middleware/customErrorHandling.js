function extendedErrorHandling(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  if (statusCode >= 400 && statusCode < 500) {
    console.warn(`WARN: ${err.name} ${err.message}`);
  } else {
    console.error(`ERROR: Error ${err.message}`);
  }
  res.status(statusCode).json({
    error: err.message || "Internal Server Error",
    requestId: req.requestId,
  });
}

module.exports = extendedErrorHandling;
