const { db } = require("./db");
const { users } = require("./schema");
const { eq } = require("drizzle-orm");

async function testgetRead() {
  try {
    const getName = "BBC";

    const result = await db
      .select()
      .from(users)
      .where(eq(users.username, getName));

    if (result.length === 0) {
      console.log("找不到該用戶");
    } else {
      console.log("查詢成功");
      console.table(result);
    }
  } catch (err) {
    console.error("查詢失敗:", err.message);
  } finally {
    process.exit();
  }
}
testgetRead();
