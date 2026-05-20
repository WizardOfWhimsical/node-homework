const { StatusCodes, ReasonPhrases } = require("../index");
const { taskSchema, patchTaskSchema } = require("../validation/taskSchema");
const getPrismaErrorInfo = require("../middleware/customPrismaErrorHandling/getPrismaErrorInfo");
const prisma = require("../db/prisma");

/**
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express request object
 * @param {Function} next - The Express Middleware
 * @returns {Promise<void>}
 */
async function create(req, res, next) {
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
    getPrismaErrorInfo(err);
    if (err.code === "P2003" || err.code === "P2014") {
      return res
        .status(404)
        .json({ message: "Invalid user, email not registered" });
    } else {
      return next(err);
    }
  }

  return res.status(StatusCodes.CREATED).json(newTaskCreated);
}

/**
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express request object
 * @param {Function} next - The Express Middleware
 * @returns {Promise<void>}
 */
async function bulkCreate(req, res, next) {
  if (!global.user_id) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "please log in", error: "Noone logged in" });
  }

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
    getPrismaErrorInfo(err);
    return next(err);
  }

  return res.status(StatusCodes.CREATED).json({
    message: "success!",
    tasksCreated: result.count,
    totalRequested: validTasks.length,
  });
}

/**
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express request object
 * @param {Function} next - The Express Middleware
 * @returns {Promise<void>}
 */
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
    getPrismaErrorInfo(err);
    if (err.code === "P1001") {
      return res.status(404).json({ message: "Database couldn't be reached" });
    } else if (err.code === "P2009") {
      return res.status(404).json({ message: "Field(s) does not exist" });
    } else {
      return next(err);
    }
  }

  const pagination = {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  };

  if (tasks.length === 0) {
    return res
      .status(StatusCodes.OK)
      .json({ task: [], pagination, message: "Task not found" });
  }

  return res.status(StatusCodes.OK).json({ tasks, pagination });
}

/**
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express request object
 * @param {Function} next - The Express Middleware
 * @returns {Promise<void>}
 */
async function show(req, res, next) {
  const taskIndex = parseInt(req.params?.id);

  if (taskIndex < 0) return;

  let taskWithUserInfo = null;
  try {
    taskWithUserInfo = await prisma.task.findUnique({
      where: { id_userId: { id: taskIndex, userId: global.user_id } },
      include: { User: { select: { id: true, name: true, email: true } } },
    });
  } catch (err) {
    getPrismaErrorInfo(err);
    return next(err);
  }

  if (!taskWithUserInfo) {
    return res.status(404).json({ message: "The task/user was not found." });
  }

  return res.status(StatusCodes.OK).json(taskWithUserInfo);
}

/**
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express request object
 * @param {Function} next - The Express Middleware
 * @returns {Promise<void>}
 */
async function update(req, res, next) {
  const taskIndex = parseInt(req.params?.id);
  if (!global.user_id) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "No user logged in",
      error: ReasonPhrases.UNAUTHORIZED,
    });
  }
  if (taskIndex < 0) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Validation Error", error: "invalid id" });
  }
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
      where: {
        id: taskIndex,
        userId: global.user_id,
      },
      data: value,
      select: {
        id: true,
        title: true,
        isCompleted: true,
        priority: true,
        userId: true,
      },
    });
  } catch (err) {
    // getPrismaErrorInfo(err);
    if (err.code === "P2025") {
      return res.status(404).json({ message: "The task was not found." });
    } else {
      // console.log("update error catch\n", err);
      return next(err);
    }
  }

  return res.status(StatusCodes.OK).json(tasks);
}
/**
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express request object
 * @param {Function} next - The Express Middleware
 * @returns {Promise<void>}
 */
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
    getPrismaErrorInfo(err);
    if (err.code === "P2025") {
      return res.status(404).json({ message: "The task was not found." });
    } else {
      return next(err);
    }
  }

  return res.status(StatusCodes.OK).json(task);
}

module.exports = {
  create,
  bulkCreate,
  index,
  update,
  deleteTask,
  show,
};
