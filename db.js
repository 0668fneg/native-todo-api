require("dotenv").config();
const { Pool } = require("pg");
const schema = require("./schema");
const { drizzle } = require("drizzle-orm/node-postgres");

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

const db = drizzle(pool, { schema });
module.exports = { pool, db };
