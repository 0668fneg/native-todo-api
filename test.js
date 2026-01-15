const pool = require("./db");

async function Connection() {
  try {
    const res = await pool.query(
      "SELECT * FROM todos WHERE id = 4 ORDER BY created_at DESC"
    );

    if (res.rows.length === 0) {
      console.log("連接成功,但todos是空的。");
    } else {
      console.log("todos:");
      console.table(res.rows);
    }
  } catch (err) {
    console.error(" 連接失敗");
    console.error(err);
  } finally {
    await pool.end();
    process.exit();
  }
}
Connection();
