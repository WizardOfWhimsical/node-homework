require("dotenv").config();
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
const { prisma, httpMocks } = require("../index");
const { logger } = require("../middleware/index");
const {
  waitForRouteHandlerCompletions,
} = require("./waitForRouteHandlerCompletion");
const {
  index,
  show,
  create,
  update,
  deleteTask,
} = require("../controllers/index");
const { EventEmitter } = require("pg-cursor");

let user1,
  user2,
  saveRes,
  saveData,
  saveTaskId = null;

beforeAll(async () => {
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
  user1 = await prisma.User.create({
    data: {
      name: "Bob",
      email: "bob@sample.com",
      hashedPassword: "StrongPassword123!",
    },
  });
  user2 = await prisma.user.create({
    data: {
      name: "Alice",
      email: "alice@sample.com",
      hashedPassword: "StrongPassword123!",
    },
  });
});

afterAll(() => {
  prisma.$disconnect();
});

describe("Testing task creation", () => {
  it("14. Create a task", async () => {
    const req = httpMocks.createRequest({
      method: "POST",
      body: { title: "first task" },
      url: "/api/tasks",
    });
    saveRes = httpMocks.createResponse({ eventEmitter: EventEmitter });

    try {
      await waitForRouteHandlerCompletions(create, req, saveRes);
    } catch (e) {
      expect(e.name).toBe("TypeError");
    }
  });

  // it("15. You can't create a task with a bogus user id", async () => {
  //   const req = httpMocks.createRequest({
  //     method: "POST",
  //     body: { title: "first task" },
  //   });
  //   req.user = { id: "9999" };
  //   saveRes = httpMocks.createResponse({ eventEmitter: EventEmitter });

  //   try {
  //     await waitForRouteHandlerCompletions(create, req, saveRes);
  //   } catch (e) {
  //     expect(e.name).toBe("PrismaClientKnownRequestError");
  //   }
  // });

  it("16. If you have a valid user Id, create() succeeds. (res.statusCode code 201)", async () => {
    const req = httpMocks.createRequest({
      method: "POST",
      body: { title: "first task" },
    });
    req.user = { id: user1.id };
    saveRes = httpMocks.createResponse({ eventEmitter: EventEmitter });

    await waitForRouteHandlerCompletions(create, req, saveRes);
    expect(saveRes.statusCode).toBe(201);
  });

  it("17. The object returned from the create() call has the expected title", async () => {
    const req = httpMocks.createRequest({
      method: "POST",
      body: { title: "second user this time" },
    });
    req.user = { id: user2.id };
    saveRes = httpMocks.createResponse({ eventEmitter: EventEmitter });

    await waitForRouteHandlerCompletions(create, req, saveRes);
    saveData = saveRes._getJSONData();
    expect(saveData.title).toMatch(/second user/);
  });

  it("18. The object has the right value for isCompleted", async () => {
    const req = httpMocks.createRequest({
      method: "POST",
      body: { title: "second user this time" },
    });
    req.user = { id: user2.id };
    saveRes = httpMocks.createResponse({ eventEmitter: EventEmitter });

    await waitForRouteHandlerCompletions(create, req, saveRes);
    saveData = saveRes._getJSONData();
    expect(saveData.isCompleted).toBe(false);
  });

  it("19. The object does not have a value for userId", async () => {
    const req = httpMocks.createRequest({
      method: "POST",
      body: { title: "second user this time" },
    });
    req.user = { id: user2.id };
    saveRes = httpMocks.createResponse({ eventEmitter: EventEmitter });

    await waitForRouteHandlerCompletions(create, req, saveRes);
    saveData = saveRes._getJSONData();
    expect(saveData).not.toHaveProperty("userId");
    saveTaskId = saveData.id;
  });
}); //end of describe

describe("Test getting created tasks", () => {
  it("20. You can't get a list of tasks without a user id", async () => {
    const req = httpMocks.createRequest({ method: "GET" });
    saveRes = httpMocks.createResponse({ eventEmitter: EventEmitter });

    await waitForRouteHandlerCompletions(index, req, saveRes);
    saveData = saveRes._getJSONData();
    logger("1\n", saveData);
    expect(saveData.error).toMatch(/Bad Request/);
  });

  it("21. If req originated with user1, we get a 200 status code", async () => {
    const req = httpMocks.createRequest({
      method: "GET",
      user: { id: user1.id },
    });
    saveRes = httpMocks.createResponse({ eventEmitter: EventEmitter });
    await waitForRouteHandlerCompletions(index, req, saveRes);
    saveData = saveRes._getJSONData();

    logger("2\n", saveData);
    expect(saveRes.statusCode).toBe(200);
  });
}); //end of describe
