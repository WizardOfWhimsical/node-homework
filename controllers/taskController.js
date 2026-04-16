const { StatusCodes } = require("../index");

function create(req, res) {
  const newTask = {
    ...req.body,
    id: taskCounter(),
    userId: global.user_id.email,
  };
  global.task.push(newTask);
  const { userId, sanitizedTask } = newTask;
  return res.status(StatusCodes.CREATED).json(sanitizedTask);
}
function getTaskList(req, res) {}
function showTask(req, res) {}
function editTask(req, res) {}
function deleteTask(req, res) {}

const taskCounter = (() => {
  let lastTaskNumber = 0;
  return () => {
    lastTaskNumber += 1;
    return lastTaskNumber;
  };
})();

module.exports = { taskCounter, create };
