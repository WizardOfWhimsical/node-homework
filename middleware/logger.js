const chalk = require("chalk");
const log = console.log();
const yellow = chalk.yellow();
const blue = chalk.blue.bold();
const magenta = chalk.magenta.italic();

function debggerLogger(req, res, next) {
  log("\n" + blue("=== Incoming Request ==="));
  log(yellow("Method:"), req.method);
  log(yellow("Path:"), req.path);
  log(yellow("Query:"), req.method);
  log(yellow("Params:"), req.params);
  log(yellow("Body:"), req.body);
  log("\n" + blue("Checking Globals"));
  log(magenta("global.users"), global.users);
  log(magenta("global.tasks"), global.tasks);
  log(magenta("global.user_id"), global.user_id);
  log(blue("=== End ===" + "\n"));
}
