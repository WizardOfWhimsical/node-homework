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

async function createMany(req, res, next) {
  const { tasks } = req.body;
  if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "Invalid request data. Expected an array of tasks" });
  }
  const validTasks = [];
  for (let task of tasks) {
    const { error, value } = taskSchema.validate(task);
    if (error) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Validation failed", details: error.details });
    }
    validTasks.push({
      title: value.title,
      isCompleted: value.isCompleted || false,
      priority: value.priority || "medium",
      userId: global.user_id,
    });
  }

  let result = null;
  try {
    result = await prisma.task.createMany({
      data: validTasks,
      skipDuplicates: false,
    });
  } catch (err) {
    return next(err);
  }
  return res.status(StatusCodes.CREATED).json({
    message: "success!",
    tasksCreated: result.count,
    totalRequested: validTasks.length,
  });
}

async function index(req, res, next) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const whereClause = { userId: global.user_id };

  let tasks = null;
  let total = null;

  if (req.query.find) {
    whereClause.title = {
      contains: req.query.find,
      mode: "insensitive",
    };
  }

  if (!global.user_id) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "No user logged in",
      error: ReasonPhrases.UNAUTHORIZED,
    });
  }

  function getOrderBy(query) {
    console.log("_*_*_*_*_*_*_*_*_*_");
    console.log("Query\n", query);
    console.log("*********");
    //Ej, if i sort by priority and it is a string, does it not do it alphabetically?
    const validSortFields = ["title", "priority", "id", "isComplete"];
    const sortBy = query.sortBy || "createdAt";
    const sortDirection = query.sortDirection === "asc" ? "asc" : "desc";
    if (validSortFields.includes(sortBy)) {
      return { [sortBy]: sortDirection };
    }
    return { createdAt: "desc" };
  }

  try {
    tasks = await prisma.task.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        isCompleted: true,
        priority: true,
        createdAt: true,
        User: { select: { name: true, email: true } },
      },
      skip: skip,
      take: limit,
      orderBy: getOrderBy(req.query),
    });

    total = await prisma.task.count({ where: whereClause });
  } catch (err) {
    if (err.code === "P1001") {
      return res.status(404).json({ message: "Database couldn't be reached" });
    } else if (err.code === "P2009") {
      return res.status(404).json({ message: "Field(s) does not exist" });
    } else {
      return next(err);
    }
  }

  if (tasks.length === 0) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ task: [], pagination, message: "Task not found" });
  }
  const pagination = {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  };
  console.log("*************************************");
  console.log("Task task:\n", tasks);
  console.log("pagination:\n", pagination);
  console.log("*************************************");
  res.status(StatusCodes.OK).json({ tasks, pagination });
  return;
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
  createMany,
  index,
  update,
  deleteTask,
  show,
};
