const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
console.log("database url", process.env.DATABASE_URL);
pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", client + "\n", "\t" + err);
});

module.exports = pool;
