const pool = require("./db");

const UserModel = {
  //根據用戶名查找用戶
  async findByUsername(username) {
    const sql = "SELECT  * FROM users WHERE username = $1";
    const result = await pool.query(sql, [username]);
    return result.rows[0];
  },

  //根據 ID 驗證用戶是否存在
  async findById(id) {
    const sql = "SELECT id, username FROM users WHERE id = $1";
    const result = await pool.query(sql, [id]);
    return result.rows[0];
  },

  // 創建新用戶
  async create(username, password) {
    const sql =
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username";
    const result = await pool.query(sql, [username, password]);
    return result.rows[0];
  },
};

module.exports = UserModel;
