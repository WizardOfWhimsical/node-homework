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
    logger(saveRes.body);
    expect(saveRes.body.message).toBe("logged in");
  });

  it("50. Verify that you are logged in: /api/tasks should not return a 401", async () => {
    const user = {
      // name: "John Deere",
      email: "jdeere@example.com",
      password: "Pa$$word20",
    };
    saveRes = await agent.get("/api/tasks").send(user);
    // logger(saveRes.status);
    expect(saveRes.status).not.toBe(401);
  });

  it("51. Verify that you can log out", async () => {
    const user = {
      // name: "John Deere",
      email: "jdeere@example.com",
      password: "Pa$$word20",
    };
    saveRes = await agent.delete("/api/users/logoff").send(user);
    expect(saveRes.body.message).toMatch(/logged out/);
  });

  it("52. Make sure that you are really logged out: /api/tasks should now return a 401", async () => {
    const user = {
      // name: "John Deere",
      email: "jdeere@example.com",
      password: "Pa$$word20",
    };
    saveRes = await agent.get("/api/tasks").send(user);
    // logger(saveRes.status);
    expect(saveRes.status).toBe(401);
  });
});
