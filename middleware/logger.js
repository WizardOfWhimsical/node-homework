const chalk = require("chalk");
// const console.log = console.console.log;
// const yellow = chalk.yellow;
// const blue = chalk.blue;
// const magenta = chalk.magenta;

function debuggerLogger(req, res, next) {
  console.log("\n" + chalk.blue("=== Incoming Request ==="));
  console.log(chalk.yellow("Method:"), req.method);
  console.log(chalk.yellow("Path:"), req.path);
  console.log(chalk.yellow("Query:"), req.method);
  console.log(chalk.yellow("Params:"), req.params);
  console.log(chalk.yellow("Body:"), req.body);
  console.log("\n" + chalk.blue("Checking Globals"));
  console.log(chalk.magenta("global.users"), global.users);
  console.log(chalk.magenta("global.tasks"), global.tasks);
  console.log(chalk.magenta("global.user_id"), global.user_id);
  console.log(chalk.blue("=== End ===" + "\n"));
  next();
}
debuggerLogger();
module.exports = { debuggerLogger };
