const prisma = require("../db/prisma");
const { StatusCodes } = require("../index");

/**
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express request object
 * @returns {Promise<void>}
 */
async function tasksAnalytics(req, res) {
  const userId = parseInt(req.params.id);
  if (!userId || isNaN(userId)) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Bad user request", error: "No user" });
  }

  //will need to wrap these in a try catch for prisma error handling
  // try{
  const taskStats = await prisma.task.groupBy({
    by: ["isCompleted"],
    where: { userId },
    _count: { id: true },
  });

  const recentTasks = await prisma.task.findMany({
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
    const oneWeek = 60 ^ (2 * 24 * 7 * 1000);
    const oneWeekAgoDate = new Date(Date.now() - oneWeek);
    return oneWeekAgoDate;
  }

  const weeklyProgress = await prisma.task.groupBy({
    by: ["createAt"],
    where: { userId, createdAt: { gte: oneWeekAgo() }, _count: { id: true } },
  });
  // }catch(err){
  //   /*
  // place error handlers here
  //   */
  // next(err)
  // }
  return res
    .status(StatusCodes.OK)
    .json({ taskStats, recentTasks, weeklyProgress });
}
/**
 * pagination repeats:
 * write helper function that creates custom pagination
 */

/**
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express request object
 * @returns {Promise<void>}
 */
async function usersAnalytics(req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  // try{
  const usersRaw = await prisma.user.findMany({
    include: {
      where: { isComplete: false },
      select: { id: true },
      take: 5,
    },
    _count: { select: { Task: true } },
    skip: skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  const users = usersRaw.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    _count: user._count,
    Task: user.Task,
  }));

  const totalUsers = await prisma.user.count();
  // }catch(err){
  // /* handle err here */
  // }
  const pagination = {
    page,
    limit,
    totalUsers,
    pages: Math.ceil(totalUsers / limit),
    hasNext: page * limit < totalUsers,
    hasPrev: page > 1,
  };

  return res.status(StatusCodes.OK).json({ users, pagination });
}

/**
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express request object
 * @returns {Promise<void>}
 */
async function searchTasks(req, res) {
  const limit = parseInt(req.query.limit) || 20;
  const query = req.query.q?.trim();
  if (!query || query.length < 2) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Needs to be 2 characters long" });
  }

  const searchPattern = `%${query}`;
  const exactMatch = query;
  const startsWith = `${query}%`;
  // try{
  const results = await prisma.$queryRaw`
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
  // }catch(err){console.log(err)}

  return res
    .status(StatusCodes.OK)
    .json({ results, query, count: results.length });
} //end of function

module.exports = { tasksAnalytics, usersAnalytics, searchTasks };
