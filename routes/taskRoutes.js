const { Router } = require("../index");
const { handleAuthMiddleware, validateUserId } = require("../middleware/index");
const {
  create,
  bulkCreate,
  bulkDelete,
  index,
  update,
  deleteTask,
  show,
} = require("../controllers/taskController");
const router = Router();

router.use(handleAuthMiddleware, validateUserId);
router.route("/").post(create).get(index);
router.route("/bulk").post(bulkCreate).delete(bulkDelete);
router.route("/:id").get(show).patch(update).delete(deleteTask);

module.exports = router;
