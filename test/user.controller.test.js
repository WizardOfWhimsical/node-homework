require("dotenv").config();
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
const waitForRouteHandlerCompletion = require("./waitForRouteHandlerCompletion");

const { prisma, httpMocks, jwt, cookie, EventEmitter } = require("../index");

const { register, logoff, logon } = require("../controllers/index");

const jwtMiddleware = require("../middleware/index");

let saveRes,
  saveData = null;

function MockResponseWithCookies() {
  const res = httpMocks.createResponse({
    eventEmitter: EventEmitter,
  });
  res.cookie = (name, value, options = {}) => {
    const serialized = cookie.serialize(name, String(value), options);
    let currentHeader = res.getHeader("Set-Cookie");
    if (currentHeader === undefined) {
      currentHeader = [];
    }
    currentHeader.push(serialized);
    res.setHeader("Set-Cookie", currentHeader);
  };
  return res;
}

beforeAll(async () => {
  // clear database
  await prisma.Task.deleteMany(); // delete all tasks
  await prisma.User.deleteMany(); // delete all users
});

afterAll(() => {
  prisma.$disconnect();
});

let jwtCookie;
const Bob = {
  name: "Bob",
  email: "bob@sample.com",
  password: "StrongPassword123!",
};

describe("Testing register, logon and log off", () => {
  it("33. User can be registered", async () => {
    const req = httpMocks.createRequest({ method: "POST", body: Bob });
    saveRes = MockResponseWithCookies();
    await waitForRouteHandlerCompletion(register, req, saveRes);
    expect(saveRes.statusCode).toBe(201);
  });

  it("34. The user can logon", async () => {
    const req = httpMocks.createRequest({ method: "POST", body: Bob });
    saveRes = MockResponseWithCookies();
    await waitForRouteHandlerCompletion(logon, req, saveRes);
    expect(saveRes.statusCode).toBe(200);
  });
});
