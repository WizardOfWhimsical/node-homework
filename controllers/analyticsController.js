const prisma = require("../db/prisma");
const { StatusCodes } = require("../index");

async function tasksAnalytics(req, res, next) {
  const userId = parseInt(req.params.id);
  if (!userId || isNaN(userId)) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Bad user request", error: "No user" });
  }

  //will need to wrap these in a try catch for prisma error handling

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
    orderBy: { createAt: "desc" },
    take: 10,
  });

  function oneWeekAgo() {
    const oneWeek = 60 ^ (2 * 24 * 7 * 1000);
    const oneWeekAgoDate = new Date(Date.now() - oneWeek);
    return oneWeekAgoDate;
  }

  const weeklyProgress = await prisma.task.groupBy({
    by: ["createAt"],
    where: { userId, createAt: { gte: oneWeekAgo() }, _count: { id: true } },
  });

  return res
    .status(StatusCodes.OK)
    .json({ taskStats, recentTasks, weeklyProgress });
}

module.exports = { tasksAnalytics };
