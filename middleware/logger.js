const chalk = require("chalk");

function requestLogger(req, res, next) {
  console.log("\n" + chalk.blue("=== Incoming Request ==="));
  console.log(chalk.yellow("RequestId:"), req.requestId);
  console.log(chalk.yellow("Method:"), req?.method || "Nothing was here");
  console.log(chalk.yellow("Path:"), req?.path || "Nothing was here");
  console.log(chalk.yellow("Query:"), req?.query || "Nothing was here");
  console.log(chalk.yellow("Params:"), req?.params || "Nothing was here");
  console.log(chalk.yellow("User:"), req?.user || "Nothing was here");
  console.log(chalk.yellow("Body:"), req?.body || "Nothing was here");
  console.log(
    chalk.yellow("Headers:"),
    "\n",
    req?.headers || "Nothing was here",
  );

  next();
}

function responseLogger(req, res, next) {
  const originalJson = res.json;

  res.json = function (body) {
    res.responseBody = body;
    return originalJson.call(this, body);
  };

  res.on("finish", () => {
    console.log("\n" + chalk.blue("=== Out going Response ==="));
    console.log(
      chalk.magenta("Response Message"),
      res.responseBody.message || res.responseBody.error || "Should be one",
    );
    console.log(chalk.magenta("Requested Url"), res.req.originalUrl);
    console.log(chalk.magenta("Requested Id"), res.req.requestId);
    console.log(chalk.magenta("Response Method"), res.req.method);
    console.log(chalk.magenta("Response Headers"), "\n", res.getHeaders());
    console.log(chalk.magenta("Response Body"), "\n", res.responseBody);

    console.log(chalk.blue("=== End ===" + "\n"));
  });
  next();
}

module.exports = { requestLogger, responseLogger };
