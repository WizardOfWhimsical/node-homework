require("dotenv").config();
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
const { prisma, httpMocks } = require("../index");
const {
  index,
  show,
  create,
  update,
  deleteTask,
} = require("../controllers/index");

let user1,
  user2,
  saveRes,
  saveData,
  saveTaskId = null;
