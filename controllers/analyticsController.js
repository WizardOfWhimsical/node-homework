const prisma = require("../db/prisma");
const { StatusCodes } = require("../index");
const getPrismaErrorInfo = require("../middleware/customPrismaErrorHandling/getPrismaErrorInfo");

/**
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express request object
 * @param {Function} next - The Express Middleware
 * @returns {Promise<void>}
 */
async function getUserAnalytics(req, res, next) {
  const userId = parseInt(req.params.id);
  if (!userId || isNaN(userId)) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Bad user request", error: "No user" });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "User not found" });
  }

  let taskStats = null,
    recentTasks = null,
    weeklyProgress = null;
  try {
    taskStats = await prisma.task.groupBy({
      by: ["isCompleted"],
      where: { userId },
      _count: { id: true },
    });

    recentTasks = await prisma.task.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        isCompleted: true,
        priority: true,
        createdAt: true,
        userId: true,
        User: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    function oneWeekAgo() {
      const oneWeek = (60 ^ 2) * 24 * 7 * 1000;
      const oneWeekAgoDate = new Date(Date.now() - oneWeek);
      return oneWeekAgoDate;
    }

    weeklyProgress = await prisma.task.groupBy({
      by: ["createdAt"],
      where: { userId, createdAt: { gte: oneWeekAgo() } },
      _count: { id: true },
    });
  } catch (err) {
    getPrismaErrorInfo(err);
    next(err);
  }

  return res
    .status(StatusCodes.OK)
    .json({ taskStats, recentTasks, weeklyProgress });
}

/**
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express request object
 * @param {Function} next - The Express Middleware
 * @returns {Promise<void>}
 */
async function getUsersWithStats(req, res, next) {
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 10;
  let skip = (page - 1) * limit;

  if (page < 1) page = 1;
  if (limit < 1 || limit > 100) limit = 10;

  let users = null,
    totalUsers = null;
  try {
    const usersRaw = await prisma.user.findMany({
      include: {
        Task: {
          where: { isCompleted: false },
          select: { id: true },
          take: 5,
        },
        _count: { select: { Task: true } },
      },
      skip: skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    users = usersRaw.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      _count: user._count,
      Task: user.Task,
    }));

    totalUsers = await prisma.user.count();
  } catch (err) {
    getPrismaErrorInfo(err);
    return next(err);
  }

  const pagination = {
    page,
    limit,
    totalUsers,
    pages: Math.ceil(totalUsers / limit),
    hasNext: page * limit < totalUsers,
    hasPrev: page > 1,
  };

  if (!users) {
    return res.status(StatusCodes.OK).json({ users: [], pagination: 0 });
  }

  return res.status(StatusCodes.OK).json({ users, pagination });
}

/**
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express request object
 * @param {Function} next - The Express Middleware
 * @returns {Promise<void>}
 */
async function searchTasks(req, res, next) {
  let limit = parseInt(req.query.limit) || 20;
  const query = req.query.q?.trim();

  if (limit < 1 || limit > 100) limit = 20;

  if (!query || query.length < 2) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Search query must be at least 2 characters long" });
  }
  //dont forget, never put users input directly in.

  const searchPattern = `%${query}%`;
  const exactMatch = query;
  const startsWith = `${query}%`;
  let results = null;
  try {
    results = await prisma.$queryRaw`
  SELECT 
    t.id,
    t.title,
    t.is_completed as "isCompleted",
    t.priority,
    t.created_at as "createdAt",
    t.user_id as "userId",
    u.name as "user_name"
  FROM tasks t
  JOIN users u ON t.user_id = u.id
  WHERE t.title ILIKE ${searchPattern} 
     OR u.name ILIKE ${searchPattern}
  ORDER BY 
    CASE 
      WHEN t.title ILIKE ${exactMatch} THEN 1
      WHEN t.title ILIKE ${startsWith} THEN 2
      WHEN t.title ILIKE ${searchPattern} THEN 3
      ELSE 4
    END,
    t.created_at DESC
  LIMIT ${parseInt(limit)}
`;
  } catch (err) {
    getPrismaErrorInfo(err);
    console.log("Search Task Error Hit");
    return next(err);
  }

  return res
    .status(StatusCodes.OK)
    .json({ results, query, count: results.length });
}

module.exports = { getUserAnalytics, getUsersWithStats, searchTasks };
