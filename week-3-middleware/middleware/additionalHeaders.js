function securityHeaders(req, res, next) {
  // res.setHeader("X-Content-Type-Options", "nosniff");
  // res.setHeader("X-Frame-Options", "Deny");
  // res.setHeader("X-XSS-Protection", 1);
  res.setHeader({
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "Deny",
    "X-XSS-Protection": "1; mode=block",
  });
  next();
}

module.exports = securityHeaders;
