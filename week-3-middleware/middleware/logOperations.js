function loggingOperations(req, res, next) {
  req.timeStamp = new Date().toLocaleTimeString();
  const { timeStamp, method, path, requestId } = req;
  console.log(`[${timeStamp}]: ${method} ${path}(${requestId})`);
}
module.exports = loggingOperations;
