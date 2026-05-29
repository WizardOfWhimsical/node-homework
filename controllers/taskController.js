const { StatusCodes, prisma } = require("../index");
const { taskSchema, patchTaskSchema } = require("../validation/taskSchema");
const { getPrismaErrorInfo } = require("../middleware/index");

/**
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express request object
 * @param {Function} next - The Express Middleware
 * @returns {Promise<void>}
 */

async function create(req, res, next) {
  if (!req.body) req.body = {};
  //DRY
  const user_id = parseInt(req?.user?.id);

  if (!user_id) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "No user logged in", error: "Bad Request" });
  } else if (isNaN(user_id)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Something went wrong with the request",
      error: "Invalid user id",
    });
  }

  const { error, value } = taskSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Validation Error", error: error.message });
  }

  value.isCompleted = value.isCompleted ?? false;
  const { title, isCompleted, priority } = value;

  let newTaskCreated = null;
  try {
    newTaskCreated = await prisma.task.create({
      data: { title, isCompleted, priority, userId: user_id },
      select: { title: true, priority: true, isCompleted: true, id: true },
    });
  } catch (err) {
    getPrismaErrorInfo(err);
    return next(err);
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
  //DRY
  const user_id = parseInt(req.user.id);
  if (!user_id || isNaN(user_id)) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "No user logged in", error: "Bad Request" });
  }

  const { tasks } = req.body;

  if (!tasks || !Array.isArray(tasks) || !(tasks.length > 2)) {
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
      userId: user_id,
    });
  }

  let result = null;
  try {
    result = await prisma.task.createMany({
      data: validTasks,
      skipDuplicates: false,
    });
  } catch (err) {
    const { message, error, status = 400, prError } = getPrismaErrorInfo(err);
    if (!prError) {
      return res.status(status).json({ message, error });
    }
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
  //DRY
  const user_id = parseInt(req.user?.id);
  // console.log("seeing what hits the user_id", user_id);
  if (!user_id || isNaN(user_id)) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "No user logged in", error: "Bad Request" });
  }

  const whereClause = { userId: user_id };

  let tasks = null;
  let total = null;

  if (req.query.find) {
    whereClause.title = {
      contains: req.query.find,
      mode: "insensitive",
    };
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
    const { message, error, status = 400, prError } = getPrismaErrorInfo(err);
    if (!prError) {
      return res.status(status).json({ message, error });
    }
    return next(err);
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
  const user_id = parseInt(req.user.id);
  //DRY
  if (!user_id || isNaN(user_id)) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "No user logged in", error: "Bad Request" });
  }
  if (taskIndex < 0) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Validation Error", error: "invalid id" });
  }

  let taskWithUserInfo = null;
  try {
    taskWithUserInfo = await prisma.task.findUnique({
      where: { id_userId: { id: taskIndex, userId: user_id } },
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
  const taskIndex = parseInt(req?.params?.id);
  const user_id = parseInt(req?.user?.id);
  //DRY
  if (!user_id || isNaN(user_id)) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "No user logged in", error: "Bad Request" });
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
        userId: user_id,
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
    if (err.code === "P2025") {
      return res.status(404).json({ message: "The task was not found." });
    } else {
      getPrismaErrorInfo(err);
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
  const user_id = parseInt(req.user?.id);
  if (taskIndex <= 0) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Must be a number", error: "taskIndex check failed" });
  }

  if (!user_id || isNaN(user_id)) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "No user logged in", error: "Bad Request, log in" });
  }

  let task = null;
  try {
    task = await prisma.task.delete({
      where: {
        id: taskIndex,
        userId: user_id,
      },
      select: { title: true, isCompleted: true, id: true },
    });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "The task was not found." });
    } else {
      getPrismaErrorInfo(err);
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
