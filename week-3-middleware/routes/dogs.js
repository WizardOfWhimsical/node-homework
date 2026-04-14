const express = require("express");
const router = express.Router();
const { ValidationError, NotFoundError } = require("../error.js");
const dogs = require("../dogData.js");
const { StatusCodes, ReasonPhrases } = require("http-status-codes");

router.get("/dogs", (req, res) => {
  res.status(200).json(dogs);
});

router.post("/adopt", (req, res) => {
  const { name, email, dogName } = req.body;
  //validation
  if (!name || !email || !dogName) {
    throw new ValidationError("Missing required fields", req.requestId);
  }
  //not found
  const dog = dogs.filter((dog) => dog.name === dogName);
  //returns an array of obj/objs that match
  if (!dog[0] || dog[0].status !== "available") {
    throw new NotFoundError("Dog not found or not available", req.requestId);
  }
  //pessimistic success
  return res.status(201).json({
    message: `Adoption request received. We will contact you at ${email} for further details.`,
    // id:req.requestId
  });
});
//ask Ej about this route, it is for testing error handling in the app, it will throw an error when accessed?
router.get("/error", (req, res) => {
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    message: "Internal Server Error",
    requestId: req.requestId,
    error: ReasonPhrases.INTERNAL_SERVER_ERROR,
  });
  // throw new NotFoundError("Route not found");
});

module.exports = router;
