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
}
