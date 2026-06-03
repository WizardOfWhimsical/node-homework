require("dotenv").config();
const request = require("supertest");
process.env.DATA_BASE_URL = process.env.TEST_DATABASE_URL;
const { prisma } = require("../index");
const { logger } = require("../middleware/index");
const { app, server } = require("../app");
let agent, saveRes;

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
    saveRes = await agent.post("/api/users/register").send(newUser);
    expect(saveRes.status).toBe(201);
  });

  it("47. Registration returns an object with the expected name", () => {
    expect(saveRes.body.user.name).toMatch(/John/);
  });

  it("48. Test that the returned object includes a csrfToken", () => {
    logger(saveRes.body);
    expect(saveRes.body).toHaveProperty("csrfToken");
  });

  it("49. You can logon as the newly registered user", async () => {
    const user = {
      // name: "John Deere",
      email: "jdeere@example.com",
      password: "Pa$$word20",
    };
    saveRes = await agent.post("/api/users/logon").send(user);
    expect(saveRes.body.messsage).toMatch(/logged/);
  });
});
