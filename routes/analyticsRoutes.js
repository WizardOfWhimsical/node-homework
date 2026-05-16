const { Router } = require("express");
const {
  getUserAnanlytics,
  getUserWithStats,
  searchTasks,
} = require("../controllers/analyticsController");
const router = Router();

router.route("/users").get(getUserWithStats);
router.route("/users/:id").get(getUserAnanlytics);
router.route("/tasks/search").get(searchTasks);

module.exports = router;
