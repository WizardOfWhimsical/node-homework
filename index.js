const {
  StatusCodes,
  ReasonPhrases,
} = require("./node_modules/http-status-codes");
const { Router } = require("express");
const express = require("express");
const morgan = require("morgan");
const { Pool } = require("pg");
const prisma = require("./db/prisma");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const util = require("util");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const { xss } = require("express-xss-sanitizer");
const rateLimiter = require("express-rate-limit");
const httpMocks = require("node-mocks-http");

module.exports = {
  httpMocks,
  helmet,
  xss,
  rateLimiter,
  StatusCodes,
  ReasonPhrases,
  Router,
  express,
  morgan,
  Pool,
  prisma,
  crypto,
  jwt,
  util,
  cookieParser,
};
