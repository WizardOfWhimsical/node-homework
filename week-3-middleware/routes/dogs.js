const { Router } = require("express");
const { ValidationError, NotFoundError } = require("../error.js");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");
const dogs = require("../dogData.js");
const router = Router();

router.get("/dogs", (req, res) => {
  res.status(200).json(dogs);
});

router.post("/adopt", (req, res) => {
  const { name, email, dogName } = req.body;

  if (!name || !email || !dogName) {
    throw new ValidationError("Missing required fields", req.requestId);
  }

  const dog = dogs.filter((dog) => dog.name === dogName);

  if (!dog[0] || dog[0].status !== "available") {
    throw new NotFoundError("Dog not found or not available", req.requestId);
  }

  return res.status(201).json({
    message: `Adoption request received. We will contact you at ${email} for further details.`,
  });
});

router.get("/error", (req, res) => {
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    message: "Internal Server Error",
    requestId: req.requestId,
    error: ReasonPhrases.INTERNAL_SERVER_ERROR,
  });
});

module.exports = router;
