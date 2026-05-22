const { Router } = require("../index");
const { handleAuthMiddleware } = require("../middleware/index");
const {
  getUserAnalytics,
  getUsersWithStats,
  searchTasks,
} = require("../controllers/analyticsController");
const router = Router();

router.use(handleAuthMiddleware);
router.route("/users").get(getUsersWithStats);
router.route("/users/:id").get(getUserAnalytics);
router.route("/tasks/search").get(searchTasks);

module.exports = router;
