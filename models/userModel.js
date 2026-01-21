const { db } = require("../db");
const { users } = require("../schema");
const { eq } = require("drizzle-orm");

const userModel = {
  //新增用戶
  create: async (username, password) => {
    const [newUser] = await db
      .insert(users)
      .values({ username, password })
      .returning();
    return newUser;
  },

  //查找用戶
  findByUsername: async (username) => {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  },

  // 根據 ID 查找用戶
  fidnById: async (id) => {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  },
};
module.exports = userModel;
