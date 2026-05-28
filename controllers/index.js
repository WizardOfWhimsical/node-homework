// const {
//   register,
//   logon,
//   logoff,
//   show,
// } = require("./userController");
const {
  getUserAnalytics,
  getUsersWithStats,
  searchTasks,
} = require("./analyticsController");
const {
  create,
  bulkCreate,
  index,
  update,
  deleteTask,
  show,
} = require("./taskController");

module.exports = {
  // showUser,
  // register,
  // logon,
  // logoff,
  getUserAnalytics,
  getUsersWithStats,
  searchTasks,
  create,
  bulkCreate,
  index,
  update,
  deleteTask,
  show,
};
