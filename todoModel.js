const pool = require("./db");

const TodoModel = {
  // 增加user_id，確保經過驗證每個user_id只能看自己的數據。
  async getAll(user_id) {
    const sql =
      "SELECT * FROM todos WHERE user_id = $1 ORDER BY created_at DESC";
    const result = await pool.query(sql, [user_id]);
    return result.rows;
  },

  // 增加user_id,確保只查到該用戶的數據
  async get(id, user_id) {
    const sql = "SELECT * FROM todos WHERE id = $1 AND user_id = $2";
    const result = await pool.query(sql, [id, user_id]);
    return result.rows[0];
  },

  async create(title, user_id) {
    const sql =
      "INSERT INTO todos (title, user_id) VALUES ($1, $2) RETURNING *";
    const result = await pool.query(sql, [title, user_id]);
    return result.rows[0];
  },

  async update(id, title, is_completed, user_id) {
    const sql =
      "UPDATE todos SET title = $1, is_completed = $2 WHERE id = $3  AND user_id = $4 RETURNING *";
    const result = await pool.query(sql, [title, is_completed, id, user_id]);
    return result.rows[0];
  },

  async delete(id, user_id) {
    const sql = "DELETE FROM todos WHERE id = $1  AND user_id = $2 RETURNING *";
    const result = await pool.query(sql, [id, user_id]);
    return result.rows[0];
  },
};

module.exports = TodoModel;
