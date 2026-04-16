function createTask(req, res) {}
function getTaskList(req, res) {}
function showTask(req, res) {}
function editTask(req, res) {}
function deleteTask(req, res) {}

const taskCounter = (() => {
  let lastTaskNumber = 0;
  return () => {
    lastTaskNumber += 1;
    return lastTaskNumber;
  };
})();

module.exports = { taskCounter };
