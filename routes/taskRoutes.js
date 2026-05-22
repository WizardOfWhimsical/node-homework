const { Router } = require("../index");
const { handleAuthMiddleware } = require("../middleware/index");
const {
  create,
  bulkCreate,
  index,
  update,
  deleteTask,
  show,
} = require("../controllers/taskController");
const router = Router();

router.use(handleAuthMiddleware);
router.route("/").post(create).get(index);
router.route("/bulk").post(bulkCreate);
router.route("/:id").get(show).patch(update).delete(deleteTask);

module.exports = router;
