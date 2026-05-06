const { StatusCodes, ReasonPhrases } = require("../index");
const { taskSchema, patchTaskSchema } = require("../validation/taskSchema");
const pool = require("../db/pg-pool");

async function create(req, res) {
  if (!req.body) req.body = {};
  const { error, value } = taskSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Validation Error", error: error.message });
  }

  value.is_completed = value.is_completed ?? false;

  const task = await pool.query(
    `INSERT INTO tasks (title, is_completed, user_id) 
  VALUES ( $1, $2, $3 ) RETURNING id, title, is_completed`,
    [value.title, value.is_completed, global.user_id],
  );
  const newTaskCreated = task.rows[0];
  //this broke it, but i had to remove the id?
  // const { id, ...newTaskCreated } = task.rows[0];
  /**
   * {title, is_complete, id}
   */
  return res.status(StatusCodes.CREATED).json(newTaskCreated);
}

async function index(req, res) {
  if (!global.user_id) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "No user logged in",
      error: ReasonPhrases.UNAUTHORIZED,
    });
  }

  // const sanitizedList = global.tasks
  //   .filter((task) => {
  //     return (
  //       task.userId.trim().toLowerCase() ===
  //       global.user_id.email.trim().toLowerCase()
  //     );
  //   })
  //   .map((task) => {
  //     const { userId, ...sanitized } = task;
  //     return sanitized;
  //   });
  const result = await pool.query(
    `SELECT * 
      FROM tasks 
      WHERE tasks.user_id = $1`,
    [global.user_id],
  );
  const list = result.rows;
  // console.log("results of index", result);
  // console.log("results of index", list);

  if (list.length === 0) {
    return res.status(StatusCodes.NOT_FOUND);
  }

  return res.status(StatusCodes.OK).json(list);
}

async function show(req, res) {
  // const taskIndex = getValidTaskIndex(req, res);
  //we return taskInded because it hadles our errors
  const taskIndex = parseInt(req.params?.id);

  if (taskIndex < 0) return;

  // const { userId, ...sanitizedTask } = global.tasks[taskIndex];
  const result = await pool.query(
    `SELECT title, id,is_completed FROM tasks WHERE id = $1`,
    [taskIndex],
  );
  console.log("RESULTS: \n", result.rows);
  res.status(StatusCodes.OK).json(result.rows);
}

async function update(req, res) {
  // const taskIndex = getValidTaskIndex(req, res);
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
  console.log("VALUES \t", value);
  console.log("TASKINDEX \t", taskIndex);
  const task = await pool.query(
    `UPDATE tasks 
      SET is_completed = $1
      WHERE id = $2
      AND user_id = $3
      RETURNING id, is_completed`,
    [value.isCompleted, taskIndex, global.user_id],
  );
  if (task.rows.length === 0) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Task not found or not owned by user" });
  }
  return res
    .status(StatusCodes.OK)
    .json({ message: "Edit Successful", task: task.rows[0] });
}

async function deleteTask(req, res) {
  const taskIndex = req.params?.id;
  if (taskIndex < 0) return;

  // const { userId, ...task } = global.tasks[taskIndex];
  // global.tasks.splice(taskIndex, 1);
  const task = await pool.query(
    `DELETE FROM tasks 
   WHERE id = $1 AND user_id = $2 
   RETURNING id, title`,
    [taskIndex, global.user_id],
  );
  if (task.rows.length === 0) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: "Task not found or not owned by user" });
  }
  return res.status(StatusCodes.OK).json(task.rows[0]);
}

// const taskCounter = (() => {
//   let lastTaskNumber = 0;
//   return () => {
//     lastTaskNumber += 1;
//     return lastTaskNumber;
//   };
// })();

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
