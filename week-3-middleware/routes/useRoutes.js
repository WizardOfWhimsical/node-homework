const { Router } = require("express");
const register = require("../controllers/userControler");
const logon = require("../controllers/logon");
const logout = require("../controllers/logout");

const router = Router();

router.route("/register").post(register);

router.route("/logon").post(logon);

router.route("/logout").post(logout);

module.exports = router;
