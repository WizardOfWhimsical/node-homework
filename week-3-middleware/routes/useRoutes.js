const { Router } = require("express");
const register = require("../controllers/userControler");

const router = Router();

router.route("/register").post(register);

router.route("/logon").post((req, res) => {
  res.status(201).json({ message: "logon post hit" });
});

module.exports = router;
