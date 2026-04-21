const { StatusCodes, ReasonPhrases } = require("../index");
const { taskSchema, patchTaskSchema } = require("../validation/taskSchema");

function create(req, res) {
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
    isCompleted: value.isCompleted ?? false,
  };
  global.tasks.push(newTask);
  const { userId, ...sanitizedTask } = newTask;
  return res.status(StatusCodes.CREATED).json(sanitizedTask);
}

function index(req, res) {
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

  if (sanitizedList.length === 0) {
    return res.status(StatusCodes.NOT_FOUND);
  }

  return res.status(StatusCodes.OK).json(sanitizedList);
}

function show(req, res) {
  const taskIndex = getValidTaskIndex(req, res);
  //we return taskInded because it hadles our errors
  if (taskIndex < 0) return;

  const { userId, ...sanitizedTask } = global.tasks[taskIndex];

  res.status(StatusCodes.OK).json(sanitizedTask);
}

function update(req, res) {
  const taskIndex = getValidTaskIndex(req, res);
  //we return taskInded because it hadles our errors
  if (taskIndex < 0) return;
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
  global.tasks[taskIndex].title = editedTask;
  const { userId, ...updatedTask } = global.tasks[taskIndex];
  return res
    .status(StatusCodes.OK)
    .json({ message: "Edit Successful", task: updatedTask });
}

function deleteTask(req, res) {
  const taskIndex = getValidTaskIndex(req, res);
  if (taskIndex < 0) return;
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
  create,
  index,
  update,
  deleteTask,
  show,
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
