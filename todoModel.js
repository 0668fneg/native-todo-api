const pool = require("./db");

const TodoModel = {
  async getAll() {
    const sql = "SELECT * FROM todos ORDER BY created_at DESC";
    const result = await pool.query(sql);
    return result.rows;
  },

  async get(id) {
    const sql = "SELECT * FROM todos WHERE id = $1 ";
    const result = await pool.query(sql, [id]);
    return result.rows[0];
  },

  async create(title) {
    const sql = "INSERT INTO todos (title) VALUES ($1) RETURNING *";
    const result = await pool.query(sql, [title]);
    return result.rows[0];
  },

  async update(id, title, is_completed) {
    const sql =
      "UPDATE todos SET title = $1, is_completed = $2 WHERE id = $3 RETURNING *";
    const result = await pool.query(sql, [title, is_completed, id]);
    return result.rows[0];
  },

  async delete(id) {
    const sql = "DELETE FROM todos WHERE id = $1 RETURNING *";
    const result = await pool.query(sql, [id]);
    return result.rows[0];
  },
};

module.exports = TodoModel;
