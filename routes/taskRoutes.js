const { Router } = require("express");
const {
  create,
  index,
  update,
  deleteTask,
  show,
} = require("../controllers/taskController");
const router = Router();

router.route("/").post(create);
router.route("/").get(index);

router.route("/:id").get(show).patch(update).delete(deleteTask);

module.exports = router;
