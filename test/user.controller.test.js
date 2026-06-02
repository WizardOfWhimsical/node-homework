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
    expect(setCookieArray[0]).toMatch(/HttpOnly/);
  });

  it("37. The returned object has the expected name", () => {
    saveData = saveRes._getJSONData();
    expect(saveData.name).toBe("Bob");
  });

  it("38. The returned data contains a csrfToken.", async () => {
    saveData = saveRes._getJSONData();
    expect(saveData).toHaveProperty("csrfToken");
  });

  it("39. You can now logoff.", async () => {
    const req = httpMocks.createRequest({ method: "POST", body: Bob });
    saveRes = MockResponseWithCookies();
    await waitForRouteHandlerCompletions(logoff, req, saveRes);
    saveData = saveRes._getJSONData();
    expect(saveData.message).toMatch(/logged out/);
  });

  it("40. The logoff clears the cookie.", () => {
    const setCookieArray = saveRes.get("Set-Cookie");
    jwtCookie = setCookieArray.find((str) => str.startsWith("jwt="));
    expect(jwtCookie).toContain("Jan 1970");
  });

  it("41. A logon with a bad password returns a 401.", async () => {
    const req = httpMocks.createRequest({
      method: "POST",
      body: { ...Bob, password: "BadPassword" },
    });

    saveRes = MockResponseWithCookies();
    await waitForRouteHandlerCompletions(logon, req, saveRes);

    expect(saveRes.statusCode).toBe(401);
  });

  it("42. You can't register with an email that has already been registered.", async () => {
    const req = httpMocks.createRequest({ method: "POST", body: Bob });
    saveRes = MockResponseWithCookies();
    await waitForRouteHandlerCompletions(register, req, saveRes);
    saveData = saveRes._getJSONData();
    // logger(saveData);
    expect(saveData.message).toBe("Email already registered");
  });
});

describe("Testing JWT middleware", () => {
  it("61. jwtMiddleware Returns a 401 if the JWT cookie is not present in the req", async () => {
    const req = httpMocks.createRequest({ method: "POST", body: Bob });
    saveRes = MockResponseWithCookies();

    await waitForRouteHandlerCompletions(jwtMiddleware, req, saveRes);
    expect(saveRes.statusCode).toBe(401);
  });

  it("62. returns a 401 if jwt is invalid", async () => {
    const req = httpMocks.createRequest({
      method: "POST",
    });
    saveRes = MockResponseWithCookies();
    const jwtCookie = jwt.sign({ id: 5, csrfToken: "badToken" }, "badSecret", {
      expiresIn: "1h",
    });
    req.cookies = { jwt: jwtCookie };
    await waitForRouteHandlerCompletions(jwtMiddleware, req, saveRes);
    expect(saveRes.statusCode).toBe(401);
  });

  it("63");
}); //end of describe
