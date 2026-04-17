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
//going to make global an array of objs that connect via an id. having a key/value tasks=[] in user
/*
.users = []{
userId: number
email: string
name: string
password: string
}
.user_id = global.users[0]
.tasks[]{
taskId: number
userId: number (links taks to user)
title: string
isCompleted: boolean
}
 */

function getTaskList(req, res) {
  if (!global.user_Id) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "No user logged in",
      error: ReasonPhrases.UNAUTHORIZED,
    });
  }
  const taskList = global.tasks.filter(
    (task) => task.userId === global.user_id.userId,
  );
  //could chain methods, but its not as declairitive
  let filteredTaskList = [];
  for (let task of taskList) {
    let { userId, ...sanitized } = task;
    filteredTaskList.push(sanitized);
  }
  return res.status(StatusCodes.OK).json({ tasks: filteredTaskList });
}
function showTask(req, res) {}
function editTask(req, res) {
  const taskIndex = getValidTaskIndex(req, res);
  if (typeof taskIndex !== "number") return taskIndex;
  //think about running a check on body key here
  const { editedTask } = req.body;
  global.tasks[taskIndex] = editedTask;
  const { userId, ...updatedTask } = global.tasks[taskIndex];
  return res
    .status(StatusCodes.OK)
    .json({ message: "Edit Successful", task: updatedTask });
}

function deleteTask(req, res) {
  const taskIndex = getValidTaskIndex(req, res);
  if (typeof taskIndex !== "number") return taskIndex;
  const { userId, ...task } = global.tasks[taskIndex];
  global.tasks.splice(taskIndex, 1);
  return res.status(StatusCodes.OK).json(task);
}

const taskCounter = (() => {
  let lastTaskNumber = 0;
  return () => {
    lastTaskNumber += 1;
    return lastTaskNumber;
  };
})();
function getValidTaskIndex(req, res) {
  const taskToFind = parseInt(req.params?.id);
  if (!taskToFind) {
    return res.status(StatusCodes.BAD_REQUEST).json({
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
  return taskIndex;
}
module.exports = { taskCounter, create, getTaskList, editTask, deleteTask };
