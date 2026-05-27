const { userSchema } = require("../validation/userSchema");
const { taskSchema, patchSchema } = require("../validation/taskSchema");

const badPassword = {
  name: "Bob",
  email: "bob@sample.com",
  password: "password",
};
const abortFlag = { abortEarly: false };

describe("User object validation test", () => {
  it("1. Does not permit a trivial password", () => {
    const { error } = userSchema(badPassword, abortFlag);
    /**
     * The ERROR returned should have and an ARRAY of (detail)
     * objects, each having a (context) with a (key) for password.
     * So we use the find() with context.key to see if the password
     * key exists.
     */
    expect(
      error.details.find((detail) => detail.context.key == "password"),
    ).toBeDefined();
  });
  it("2. The user schema requires email", () => {});
  it("3. The user schema does not accept invalid email", () => {});
  it("4. The user Schema requires password", () => {});
  it("5. The user Schema requires name", () => {});
  it("6. The user name must be valid (3 - 30 characters", () => {});
  it("7. If validation is performed on a valid user object, error comes back falsy", () => {});
  it("8. The task schema requires a title", () => {});
  it("9. If an isCompleted value is specified, it must be valid", () => {});
  it("10. If an isCompleted value is not specified but the rest of the object is valid, a default of false is provided by validation", () => {});
  it("11. If isCompleted in the provided object has the value true, it remains true after validation", () => {});
});
describe("Patch Task schema testing", () => {
  it("12. The patch schema does not require a title", () => {});
  it("13. If no value i sprovided for isCompleted this remains undefined in the returned value", () => {});
});
