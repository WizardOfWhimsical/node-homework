const prisma = require("../db/prisma");
const { StatusCodes } = require("../index");

async function tasksAnalytics(req, res, next) {
  const userId = parseInt(req.params.id);
  if (!userId || isNaN(userId)) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Bad user request", error: "No user" });
  }

  const taskStats = await prisma.task.groupBy({
    by: ["isCompleted"],
    where: { userId },
    _count: { id: true },
  });

  const recentTassks = await prisma.task.findMany({
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
}
