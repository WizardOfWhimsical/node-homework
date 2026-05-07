const { Router } = require("../index");
const { register, logon, logoff } = require("../controllers/userController");

const router = Router();

router.route("/register").post(register);
router.route("/logon").post(logon);
router.route("/logoff").delete(logoff);

module.exports = router;
