const { Router } = require("express");
const {
  usersAnalytics,
  tasksAnalytics,
} = require("../controllers/analyticsController");
const router = Router();

router.route("/").get(usersAnalytics);
router.route("/:id").get(tasksAnalytics);

module.exports = router;
