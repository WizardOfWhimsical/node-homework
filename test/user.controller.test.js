require("dotenv").config();
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
const {
  waitForRouteHandlerCompletions,
} = require("./waitForRouteHandlerCompletion");

const { prisma, httpMocks, jwt, cookie, EventEmitter } = require("../index");

const { register, logoff, logon } = require("../controllers/index");

const {
  handleAuthMiddleware: jwtMiddleware,
  logger,
} = require("../middleware/index");

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
    await waitForRouteHandlerCompletions(register, req, saveRes);
    expect(saveRes.statusCode).toBe(201);
  });

  it("34. The user can logon", async () => {
    const req = httpMocks.createRequest({ method: "POST", body: Bob });
    saveRes = MockResponseWithCookies();
    await waitForRouteHandlerCompletions(logon, req, saveRes);
    expect(saveRes.statusCode).toBe(200);
  });

  it("35. A string in the cookie array starts with 'jwt='.", async () => {
    const setCookieArray = saveRes.get("Set-Cookie");
    jwtCookie = setCookieArray.find((str) => str.startsWith("jwt="));
    expect(jwtCookie).toBeDefined();
  });

  it("36. The string contains 'HTTPOnly'.", async () => {
    const setCookieArray = saveRes.get("Set-Cookie");
    // logger(setCookieArray[0].split());
    expect(setCookieArray[0]).toMatch(/HttpOnly/);
  });

  it("37. The returned data contains a csrfToken.", async () => {
    const resp = saveRes._getJSONData();
    logger({ resp });
    expect(resp).toHaveProperty("csrfToken");
  });

  it("38. ");
}); //end of describe
