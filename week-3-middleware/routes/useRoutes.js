const { Router } = require("express");
const { register, logon, logoff } = require("../controllers/userControler");

const router = Router();

router.route("/register").post(register);

router.route("/logon").post(logon);

router.route("/logout").post(logoff);

module.exports = router;
