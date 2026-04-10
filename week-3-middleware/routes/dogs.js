const express = require("express");
const router = express.Router();
const dogs = require("../dogData.js");

router.get("/dogs", (req, res) => {
  res.status(200).json(dogs);
});

router.post("/adopt", (req, res) => {
  const { name, email, dogName } = req.body;
  if (!name || !email || !dogName) {
    return res.status(400).json({ error: "All fields are required" });
  }

  return res.status(201).json({
    message: `Adoption request received. We will contact you at ${email} for further details.`,
  });
});
//ask Ej about this route, it is for testing error handling in the app, it will throw an error when accessed.
router.get("/error", (req, res) => {
  throw new Error("Test error");
});

module.exports = router;
