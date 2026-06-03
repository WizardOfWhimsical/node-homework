require("dotenv").config();
const request = require("supertest");
process.env.DATA_BASE_URL = process.env.TEST_DATABASE_URL;
const { prisma } = require("../index");
let agent, saveRes;
const { app, server } = require("../app");

beforeAll(async () => {
  await prisma.Task.deleteMany();
  await prisma.User.deleteMany();
  agent = request.agent(app);
});

afterAll(async () => {
  prisma.$disconnect();
  server.close();
});

describe("register a user", () => {
  it("46. it creates the user entry", async () => {
    const newUser = {
      name: "John Deere",
      email: "jdeere@example.com",
      password: "Pa$$word20",
    };
    saveRes = await agent.post("/user/register").send(newUser);
    expect(saveRes.status).toBe(200);
  });
});
