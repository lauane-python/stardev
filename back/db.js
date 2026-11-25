require("./loadEnv");
const mysql = require("mysql2/promise");

const usarSsl = ["true", "1", "yes"].includes(
  String(process.env.DB_SSL || "").toLowerCase().trim()
);

const pool = mysql.createPool({
  host: (process.env.DB_HOST || "localhost").trim(),
  user: (process.env.DB_USER || "root").trim(),
  password: process.env.DB_PASSWORD || "",
  port: Number(process.env.DB_PORT) || 3306,
  database: (process.env.DB_NAME || "stardev").trim(),
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  ssl: usarSsl ? { rejectUnauthorized: false } : undefined,
});

module.exports = pool;
