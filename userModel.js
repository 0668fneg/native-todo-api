const pool = require("./db");

const UserModel = {
  //根據用戶名查找用戶
  async findByUsername(usernmae) {
    const sql = "SELECT  * FROM users WHERE username = $1";
    const result = await pool.query(sql, [usernmae]);
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
