const {
  register,
  logon,
  logoff,
  //  show
} = require("./userController");
const {
  getUserAnalytics,
  getUsersWithStats,
  searchTasks,
} = require("./analyticsController");
const {
  create,
  bulkCreate,
  bulkDelete,
  index,
  update,
  deleteTask,
  show,
} = require("./taskController");

module.exports = {
  // show: showUserStats,
  register,
  logon,
  logoff,
  getUserAnalytics,
  getUsersWithStats,
  searchTasks,
  create,
  bulkCreate,
  bulkDelete,
  index,
  update,
  deleteTask,
  show,
};
