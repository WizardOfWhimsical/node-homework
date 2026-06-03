const { userSchema } = require("../validation/userSchema");
const { taskSchema, patchTaskSchema } = require("../validation/taskSchema");

const abortFlag = { abortEarly: false };

let error = null,
  value = null;

describe("User schema validation test", () => {
  function makeNewUser(overRide = {}) {
    return {
      name: "Bob",
      email: "bob@sample.com",
      password: "StrongPassword123!",
      ...overRide,
    };
  }

  it("1. Does not permit a trivial password", () => {
    ({ error, value } = userSchema.validate(
      makeNewUser({ password: "password" }),
      abortFlag,
    ));

    expect(
      error.details.find((detail) => detail.context.key === "password"),
    ).toBeDefined();
  });

  it("2. The user schema requires email", () => {
    let { email, ...user } = makeNewUser();
    ({ error } = userSchema.validate(user, abortFlag));

    expect(
      error.details.find((detail) => detail.context.key === "email"),
    ).toBeDefined();
  });
  it("3. The user schema does not accept invalid email", () => {
    ({ error } = userSchema.validate(
      makeNewUser({ email: "bademail.com" }),
      abortFlag,
    ));

    expect(
      error.details.find((detail) => detail.context.key === "email"),
    ).toBeDefined();
  });

  it("4. The user Schema requires password", () => {
    let { password, ...user } = makeNewUser();
    ({ error } = userSchema.validate(user, abortFlag));

    expect(
      error.details.find((detail) => detail.context.key === "password"),
    ).toBeDefined();
  });
  it("5. The user Schema requires name", () => {
    let { name, ...user } = makeNewUser();
    ({ error } = userSchema.validate(user, abortFlag));
    expect(
      error.details.find((detail) => detail.context.key === "name"),
    ).toBeDefined();
  });
  it("6. The user name must be valid (3 - 30 characters)", () => {
    ({ error } = userSchema.validate(makeNewUser({ name: "Po" }), abortFlag));
    expect(
      error.details.find((detail) => detail.context.key === "name"),
    ).toBeDefined();
  });
  it("7. If validation is performed on a valid user object, error comes back falsy", () => {
    ({ error, value } = userSchema.validate(makeNewUser(), abortFlag));
    expect(error).toBeUndefined();
  });
});

function makeNewTask(overRide = {}) {
  return { title: "Some task todo", ...overRide };
}
describe("Task schema validation testing", () => {
  it("8. The task schema requires a title", () => {
    const { title, ...task } = makeNewTask();
    ({ error, value } = taskSchema.validate(task));
    expect(
      error.details.find((detail) => detail.context.key === "title"),
    ).toBeDefined();
  });
  it("9. If an isCompleted value is specified, it must be valid", () => {
    ({ error, value } = taskSchema.validate(makeNewTask({ isCompleted: 2 })));
    expect(error.details[0].message).toMatch(/must be a boolean/);
  });
  it("10. If an isCompleted value is not specified but the rest of the object isvalid, a default of false is provided by validation", () => {
    ({ error, value } = taskSchema.validate(makeNewTask()));
    expect(value.isCompleted).toBe(false);
  });
  it("11. If isCompleted in the provided object has the value true, it remains true after validation", () => {
    ({ error, value } = taskSchema.validate(
      makeNewTask({ isCompleted: true }),
    ));
    expect(value.isCompleted).toBe(true);
  });
});

describe("Patch Task schema testing", () => {
  it("12. The patch schema does not require a title", () => {
    const { title, ...removedTitle } = makeNewTask({
      isCompleted: true,
      priority: "low",
    });
    ({ error, value } = patchTaskSchema.validate(removedTitle));
    expect(error).toBeUndefined();
  });
  it("13. If no value i sprovided for isCompleted this remains undefined in the returned value", () => {
    const noIsCompleted = makeNewTask({ priority: "low" });
    expect(noIsCompleted.isCompleted).toBeUndefined();
  });
});
