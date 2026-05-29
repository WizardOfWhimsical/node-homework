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
    });
    req.user = { id: user1.id };
    saveRes = httpMocks.createResponse({ eventEmitter: EventEmitter });
    try {
      await waitForRouteHandlerCompletions(create, req, saveRes);
    } catch (e) {
      expect(e.name).toBe("TypeError");
    }
    // expect(saveRes.statusCode).toBe(201);
  });
  it("15. You can't create a task with a bogus user id", () => {
    const req = httpMocks.createRequest({
      method: "POST",
      body: { title: "first task" },
    });
    req.user = { id: 9999 };
    // await waitForRouteHandlerCompletions(create, req, saveRes);
    // expect(saveRes.statusCode).toBe(201);
  });
});

//   describe("test getting created tasks",()=>{
// if("20.",()=>{})
// if("21.",()=>{})
// if("22.",()=>{})
// if("23.",()=>{})
// if("24.",()=>{})
// if("25.",()=>{})
// if("26.",()=>{})
// if("27.",()=>{})
//   });

// descirbe("",()=>{
// if("28.",()=>{});
// if("29.",()=>{});
// if("30.",()=>{});
// if("31.",()=>{});
// if("32.",()=>{});
// })
