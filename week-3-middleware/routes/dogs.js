const express = require("express");
const router = express.Router();
const { ValidationError, NotFoundError } = require("../error.js");
const dogs = require("../dogData.js");

router.get("/dogs", (req, res) => {
  res.status(200).json(dogs);
});

router.post("/adopt", (req, res) => {
  const { name, email, dogName, dog } = req.body;
  //validation
  if (!name || !email || !dogName) {
    throw new ValidationError("Missing required fields");
  }
  //not found
  if (!dog || dog.status !== "available") {
    throw new NotFoundError("Dog not found or not available");
  }
  //pessimistic success
  return res.status(201).json({
    message: `Adoption request received. We will contact you at ${email} for further details.`,
  });
});
//ask Ej about this route, it is for testing error handling in the app, it will throw an error when accessed?
router.get("/error", (req, res) => {
  throw new Error("Test error");
});

module.exports = router;
