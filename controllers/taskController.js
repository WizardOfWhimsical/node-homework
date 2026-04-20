const { StatusCodes, ReasonPhrases } = require("../index");
const { taskSchema, patchTaskSchema } = require("../validation/taskSchema");

function createTask(req, res) {
  if (!req.body) req.body = {};
  const { error, value } = taskSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Validation Error", error: error.message });
  }

  const newTask = {
    ...value,
    id: taskCounter(),
    userId: global.user_id.email,
    isCompleted: req.body.isCompleted ?? false,
  };
  global.tasks.push(newTask);
  const { userId, ...sanitizedTask } = newTask;
  return res.status(StatusCodes.CREATED).json(sanitizedTask);
}

function getTaskList(req, res) {
  if (!global.user_id) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "No user logged in",
      error: ReasonPhrases.UNAUTHORIZED,
    });
  }
  const sanitizedList = global.tasks
    .filter((task) => {
      return (
        task.userId.trim().toLowerCase() ===
        global.user_id.email.trim().toLowerCase()
      );
    })
    .map((task) => {
      const { userId, ...sanitized } = task;
      return sanitized;
    });

  return res.status(StatusCodes.OK).json({ tasks: sanitizedList });
}

function showTask(req, res) {
  const searchParam = req.query.search.trim().toLowerCase();
  if (!searchParam) {
    res.status(StatusCodes.BAD_REQUEST).json({
      message: "Search request was empty",
      errror: ReasonPhrases.BAD_REQUEST,
    });
  }

  const sanitizedSearchedTaskList = global.tasks
    .filter((task) => {
      return (
        task.userId.trim().toLowerCase() ===
        global.user_id.email.trim().toLowerCase()
      );
    })
    .filter((task) => {
      return task.title.toLowerCase().startsWith(searchParam);
    })
    .map((task) => {
      const { userId, ...sanitized } = task;
      return sanitized;
    });
  console.log(sanitizedSearchedTaskList);
  res
    .status(StatusCodes.OK)
    .json({ message: "Search successful", task: sanitizedSearchedTaskList });
}

function editTask(req, res) {
  const taskIndex = getValidTaskIndex(req, res);
  //we return taskInded because it hadles our errors
  if (typeof taskIndex !== "number") return taskIndex;
  if (!req.body) req.body = {};
  const { error, value } = patchTaskSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Validation Error", error: error.message });
  }

  const { editedTask } = value;
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
module.exports = {
  taskCounter,
  createTask,
  getTaskList,
  editTask,
  deleteTask,
  showTask,
};

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
