const { Router } = require("express");
const register = require("../controllers/userControler");
const logon = require("../controllers/logon");

const router = Router();

router.route("/register").post(register);

router.route("/logon").post(logon);

module.exports = router;
