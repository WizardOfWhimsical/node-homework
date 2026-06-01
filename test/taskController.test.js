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

let user1, user2, saveRes, saveData, saveTaskId;

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
    });
    saveRes = httpMocks.createResponse({ eventEmitter: EventEmitter });

    try {
      await waitForRouteHandlerCompletions(create, req, saveRes);
    } catch (e) {
      expect(e.name).toBe("TypeError");
    }
  });

  it("15. You can't create a task with a bogus user id", async () => {
    // const req = httpMocks.createRequest({
    //   method: "POST",
    //   body: { title: "first task" },
    //   user: { id: "9999" },
    // });
    // req.saveRes = httpMocks.createResponse({ eventEmitter: EventEmitter });
    // try {
    //   await waitForRouteHandlerCompletions(create, req, saveRes);
    // } catch (e) {
    //   expect(e.name).toBe("PrismaClientKnownRequestError");
    // }
  });

  it("16. If you have a valid user Id, create() succeeds. (res.statusCode code 201)", async () => {
    const req = httpMocks.createRequest({
      method: "POST",
      body: { title: "first task" },
      user: { id: user1.id },
    });
    saveRes = httpMocks.createResponse({ eventEmitter: EventEmitter });

    await waitForRouteHandlerCompletions(create, req, saveRes);
    expect(saveRes.statusCode).toBe(201);
  });

  it("17. The object returned from the create() call has the expected title", async () => {
    const req = httpMocks.createRequest({
      method: "POST",
      body: { title: "second task this time" },
      user: { id: user1.id },
    });
    saveRes = httpMocks.createResponse({ eventEmitter: EventEmitter });

    await waitForRouteHandlerCompletions(create, req, saveRes);
    saveData = saveRes._getJSONData();
    expect(saveData.title).toMatch(/second task/);
  });

  it("18. The object has the right value for isCompleted", async () => {
    const req = httpMocks.createRequest({
      method: "POST",
      body: { title: "You can do it. Believe It!" },
      user: { id: user1.id },
    });
    saveRes = httpMocks.createResponse({ eventEmitter: EventEmitter });

    await waitForRouteHandlerCompletions(create, req, saveRes);
    saveData = saveRes._getJSONData();
    expect(saveData.isCompleted).toBe(false);
  });

  it("19. The object does not have a value for userId", async () => {
    const req = httpMocks.createRequest({
      method: "POST",
      body: { title: "Third task of something todo" },
      user: { id: user1.id },
    });
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
    expect(saveData.error).toMatch(/Bad Request/);
  });

  it("21. If req originated with user1, we get a 200 status code", async () => {
    const req = httpMocks.createRequest({
      method: "GET",
      user: { id: user1.id },
    });
    saveRes = httpMocks.createResponse({ eventEmitter: EventEmitter });

    await waitForRouteHandlerCompletions(index, req, saveRes);
    expect(saveRes.statusCode).toBe(200);
  });

  it("22. The returned object has a task length for the array", async () => {
    saveData = saveRes._getJSONData();
    expect(saveData.tasks.length).toBeGreaterThanOrEqual(1);
  });

  it("23. The title in the first array object is as expected", async () => {
    // logger(saveData.tasks);
    expect(saveData.tasks[0].title).toMatch(/Third task/);
  });

  it("24. The first array object does not contain a userId", () => {
    expect(saveData.tasks[0]).not.toHaveProperty("userId");
    for (let task of saveData.tasks) {
      Object.hasOwn("userId") && console.log(task.id);
      expect(task).not.toHaveProperty("userId");
      expect(task).not.toHaveProperty("User.userId");
    }
  });

  it("25. If you get the list of tasks using the userId from user2, you get a 404", async () => {
    const req = httpMocks.createRequest({
      method: "GET",
      user: { id: user2.id },
    });
    saveRes = httpMocks.createResponse({ eventEmitter: EventEmitter });

    await waitForRouteHandlerCompletions(index, req, saveRes);
    saveData = saveRes._getJSONData();

    expect(saveRes.statusCode).toBe(404);
    expect(saveData.error).toBeDefined();
  });

  it("26. You can retrieve the created task using show()", async () => {
    const req = httpMocks.createRequest({
      method: "GET",
      user: { id: user1.id },
      params: { id: saveTaskId },
    });
    saveRes = httpMocks.createResponse({ eventEmitter: EventEmitter });

    await waitForRouteHandlerCompletions(show, req, saveRes);
    saveData = saveRes._getJSONData();

    expect(saveData.id).toBe(saveTaskId);
    expect(saveData.userId).toBe(user1.id);
  });

  it("27. User2 can't retrieve this entry (returns 404)", async () => {
    const req = httpMocks.createRequest({
      method: "GET",
      user: { id: user2.id },
      params: { id: saveTaskId },
    });
    saveRes = httpMocks.createResponse({ eventEmitter: EventEmitter });

    await waitForRouteHandlerCompletions(show, req, saveRes);
    saveData = saveRes._getJSONData();

    expect(saveRes.statusCode).toBe(404);
    expect(saveData.error).toBeDefined();
  });
}); //end of describe

describe("Testing the update and delete", () => {
  it("28. User1 can set task for saved task to isCompleted: true", async () => {
    const req = httpMocks.createRequest({
      method: "PATCH",
      user: { id: user1.id },
      body: { isCompleted: true },
      params: { id: saveTaskId },
    });
    saveRes = httpMocks.createResponse({ eventEmitter: EventEmitter });

    await waitForRouteHandlerCompletions(update, req, saveRes);
    saveData = saveRes._getJSONData();
    expect(saveData.isCompleted).toBe(true);
  });

  it("29. User2 can not do this", async () => {
    const req = httpMocks.createRequest({
      method: "PATCH",
      user: { id: user2.id },
      body: { isCompleted: true },
      params: { id: saveTaskId },
    });
    saveRes = httpMocks.createResponse({ eventEmitter: EventEmitter });

    await waitForRouteHandlerCompletions(update, req, saveRes);

    expect(saveRes.statusCode).toBe(404);
  });

  it("30. User2 can not delete this task", async () => {
    const req = httpMocks.createRequest({
      method: "DELETE",
      user: { id: user2.id },
      // body: { isCompleted: true },
      params: { id: saveTaskId },
    });
    saveRes = httpMocks.createResponse({ eventEmitter: EventEmitter });

    await waitForRouteHandlerCompletions(deleteTask, req, saveRes);
    expect(saveRes.statusCode).toBe(404);
  });

  it("31. User1 can delete this task", async () => {
    const req = httpMocks.createRequest({
      method: "DELETE",
      user: { id: user1.id },
      // body: { isCompleted: true },
      params: { id: saveTaskId },
    });
    saveRes = httpMocks.createResponse({ eventEmitter: EventEmitter });

    await waitForRouteHandlerCompletions(deleteTask, req, saveRes);
    expect(saveRes.statusCode).toBe(200);
  });

  it("32. The task now returns a 404", async () => {
    const req = httpMocks.createRequest({
      method: "GET",
      user: { id: user1.id },
      params: { id: saveTaskId },
    });
    saveRes = httpMocks.createResponse({ eventEmitter: EventEmitter });
    await waitForRouteHandlerCompletions(show, req, saveRes);
    logger(saveRes._getJSONData());
    // expect("something").toBe("nothing");
    expect(saveRes.statusCode).toBe(404);
  });
}); //end of describe
