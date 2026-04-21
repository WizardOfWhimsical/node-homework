const { Router } = require("express");
const {
  create,
  index,
  update,
  deleteTask,
  show,
} = require("../controllers/taskController");
const router = Router();

router.route("/").get(index).post(create);

router.route("/:id").get(show).patch(update).delete(deleteTask);

module.exports = router;
