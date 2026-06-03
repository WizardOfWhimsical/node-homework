require("dotenv").config();
const request = require("supertest");
process.env.DATA_BASE_URL = process.env.TEST_DATABASE_URL;
const { prisma } = require("../index");
let agent, saveRes;
const { app, server } = require("../app");
