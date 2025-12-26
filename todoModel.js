const pool = require("./db");

const TodoModel = {
  async getAll() {
    const sql = "SELECT * FRON todos ORDER BY created_at DESC";
    const result = await pool.query(sql);
    return result.rows;
  },

  async create(title) {
    const sql = "INSERT INTO todos (title) VALUES ($1) RETURNING *";
    const result = await pool.query(sql, [title]);
    return result.rows[0];
  },
};

module.exports = TodoModel;
