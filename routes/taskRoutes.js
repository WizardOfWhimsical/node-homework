const { Router } = require("express");
const {
  createTask,
  getTaskList,
  editTask,
  deleteTask,
  showTask,
} = require("../controllers/taskController");
const router = Router();

router.route("/").get(getTaskList).post(createTask);

router.route("/:id").get(showTask).patch(editTask).delete(deleteTask);

module.exports = router;
