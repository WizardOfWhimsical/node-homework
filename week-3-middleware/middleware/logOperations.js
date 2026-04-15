function viewLoggingOperations(req, res, next) {
  const timeStamp = new Date().toLocaleTimeString();
  const { method, path, requestId } = req;
  console.log(`[${timeStamp}]: ${method} ${path} (${requestId})`);
  next();
}
module.exports = viewLoggingOperations;
