const express = require("express");
const router = express.Router();
const dogs = require("../dogData.js");

router.get("/dogs", (req, res) => {
  res.json(dogs);
});

function validateAdoptionRequest(req, res, next) {
  const { name, address, email, dogName } = req.body;
  if (!name || !email || !dogName || !address) {
    return res.status(400).json({ error: "All fields are required" });
  }
  next();
}

router.post("/adopt", validateAdoptionRequest, (req, res) => {
  return res.status(201).json({
    message: `Adoption request received. We will contact you at ${req.body.email} for further details.`,
  });
});

router.get("/error", (req, res) => {
  throw new Error("Test error");
});

module.exports = router;
