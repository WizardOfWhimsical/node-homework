const { StatusCodes, ReasonPhrases } = require("../index");
const { taskSchema, patchTaskSchema } = require("../validation/taskSchema");
const prisma = require("../db/prisma");

async function create(req, res, next) {
  // console.log("Creating somehting i hope\n", typeof req.body, req.body);
  if (!req.body) req.body = {};
  const { error, value } = taskSchema.validate(req.body, { abortEarly: false });

  if (error) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Validation Error", error: error.message });
    return;
  }

  value.isCompleted = value.isCompleted ?? false;

  const { title, isCompleted, priority } = value;
  let newTaskCreated = null;
  try {
    newTaskCreated = await prisma.task.create({
      data: { title, isCompleted, priority, userId: global.user_id },
      select: { title: true, priority: true, isCompleted: true, id: true },
    });
  } catch (err) {
    if (err.code === "P2003" || err.code === "P2014") {
      return res
        .status(404)
        .json({ message: "Invalid user, email not registered" });
    } else {
      return next(err);
    }
  }

  console.log("New Task Created:\n", newTaskCreated);
  return res.status(StatusCodes.CREATED).json(newTaskCreated);
}

async function index(req, res, next) {
  if (!global.user_id) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "No user logged in",
      error: ReasonPhrases.UNAUTHORIZED,
    });
  }
  let list = null;
  try {
    list = await prisma.task.findMany({
      where: { userId: global.user_id },
      select: {
        id: true,
        title: true,
        isComplete: true,
        priority: true,
        createAt: true,
        User: { select: { name: true, email: true } },
      },
    });
  } catch (err) {
    if (err.code === "P1001") {
      return res.status(404).json({ message: "Database couldn't be reached" });
    } else if (err.code === "P2009") {
      return res.status(404).json({ message: "Field(s) does not exist" });
    } else {
      return next(err);
    }
  }

  if (list.length === 0) {
    return res.status(StatusCodes.NOT_FOUND);
  }
  console.log("Task list:\n", list);
  return res.status(StatusCodes.OK).json(list);
}

async function show(req, res, next) {
  const taskIndex = parseInt(req.params?.id);

  if (taskIndex < 0) return;

  let task = null;
  try {
    task = await prisma.task.findUnique({
      where: {
        id: taskIndex,
        userId: global.user_id,
      },
      select: { title: true, isCompleted: true, id: true },
    });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "The task was not found." });
    } else {
      return next(err);
    }
  }

  console.log("Show Task: \n", task);
  res.status(StatusCodes.OK).json(task);
}

async function update(req, res, next) {
  const taskIndex = parseInt(req.params?.id);
  if (!global.user_id) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "No user logged in",
      error: ReasonPhrases.UNAUTHORIZED,
    });
  }
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

  let tasks = null;
  try {
    tasks = await prisma.task.update({
      data: value,
      where: {
        id: taskIndex,
        userId: global.user_id,
      },
      select: { title: true, isCompleted: true, id: true },
    });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "The task was not found." });
    } else {
      return next(err);
    }
  }

  console.log("Updated Task: \n", tasks);
  return res.status(StatusCodes.OK).json({ message: "Edit Successful", tasks });
}

async function deleteTask(req, res, next) {
  const taskIndex = parseInt(req.params?.id);
  if (taskIndex < 0) return;

  let task = null;
  try {
    task = await prisma.task.delete({
      where: {
        id: taskIndex,
        userId: global.user_id,
      },
      select: { title: true, isCompleted: true, id: true },
    });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "The task was not found." });
    } else {
      return next(err);
    }
  }

  console.log("Deleted Task: \n", task);
  return res.status(StatusCodes.OK).json(task);
}

module.exports = {
  create,
  index,
  update,
  deleteTask,
  show,
};
