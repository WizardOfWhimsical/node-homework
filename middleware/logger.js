const chalk = require("chalk");

function requestLogger(req, res, next) {
  console.log("\n" + chalk.blue("=== Incoming Request ==="));
  console.log(chalk.yellow("Method:"), req?.method);
  console.log(chalk.yellow("Path:"), req?.path);
  console.log(chalk.yellow("Query:"), req?.query);
  console.log(chalk.yellow("Params:"), req?.params);
  console.log(chalk.yellow("Body:"), req?.body);

  next();
}

function responseLogger(req, res, next) {
  res.on("finish", () => {
    console.log("\n" + chalk.blue("Checking Globals"));
    console.log(chalk.magenta("global.user_id"), global?.user_id);
    console.log(chalk.blue("=== End ===" + "\n"));
  });
  next();
}

module.exports = { requestLogger, responseLogger };
