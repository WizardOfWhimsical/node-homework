const { Router } = require("express");
const {
  create,
  getTaskList,
  editTask,
  deleteTask,
  showTask,
} = require("../controllers/taskController");
const router = Router();

router.route("/").get(getTaskList).post(create);

router.route("/:id").get(showTask).patch(editTask).delete(deleteTask);

module.exports = router;
