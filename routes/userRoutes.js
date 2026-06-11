const { Router } = require("../index");
const {
  register,
  logon,
  logoff,
  show,
} = require("../controllers/userController");
const { googleLogon } = require("../security/googleLogon.js");

const router = Router();

router.route("/googleLogon").post(googleLogon);
router.route("/register").post(register);
router.route("/logon").post(logon);
router.route("/logoff").post(logoff).delete(logoff);
router.route("/:id").get(show);

module.exports = router;
