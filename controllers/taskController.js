const { StatusCodes, ReasonPhrases } = require("../index");

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

function deleteTask(req, res) {
  const taskToFind = parseInt(req.params?.id);
  if (!taskToFind || typeof taskToFind === "number") {
    res.status(StatusCodes.BAD_REQUEST).json({
      message: "The asked for ID is not valid",
      error: "Invalid Request",
    });
  }
  const taskIndex = global.tasks.findIndex(
    (task) => task.id === taskToFind && task.userId === global.user_id.email,
  );
  if (taskIndex === -1) {
    return res.status(StatusCodes.NOT_FOUND).json({
      message: "That task was not found",
      error: ReasonPhrases.NOT_FOUND,
    });
  }
  //ask about this in the morning. i think this is supposed to be destructured
  const task = { userId, ...global.tasks[taskIndex] };
  global.tasks.splice(taskIndex, 1);
  res.status(StatusCodes.OK).json(task);
}

const taskCounter = (() => {
  let lastTaskNumber = 0;
  return () => {
    lastTaskNumber += 1;
    return lastTaskNumber;
  };
})();

module.exports = { taskCounter, create };
