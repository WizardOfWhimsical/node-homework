const { Router } = require("express");
const { register, logon, logoff } = require("../controllers/useController");

const router = Router();

router.route("/register").post(register);
router.route("/logon").post(logon);
router.route("/logoff").post(logoff);

module.exports = router;
