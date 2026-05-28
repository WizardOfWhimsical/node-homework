require("dotenv").config();
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
const { prisma, httpMocks } = require("../index");
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

let user1,
  user2,
  saveRes,
  saveData,
  saveTaskId = null;

beforeAll(async () => {
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
  user1 = await prisma.user.create({
    name: "Bob",
    email: "bob@sample.com",
    password: "StrongPassword123!",
  });
  user2 = await prisma.user.create({
    name: "Alice",
    email: "alice@sample.com",
    password: "StrongPassword123!",
  });
});

afterAll(() => {
  prisma.$disconnect();
});
