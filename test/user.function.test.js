require("dotenv").config();
const request = require("supertest");
process.env.DATA_BASE_URL = process.env.TEST_DATABASE_URL;
const { prisma } = require("../index");
let agent, saveRes;
const { app, server } = require("../app");

beforeAll(async () => {
  await prisma.Task.deleteMany();
  await prisma.User.deleteMsny();
  agent = request.agent(app);
});

afterAll(async () => {
  prisma.$disconnect();
  server.close();
});
