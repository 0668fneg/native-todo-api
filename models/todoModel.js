const { db } = require("../db");
const { todos } = require("../schema");
const { eq, and } = require("drizzle-orm");

const todoModel = {
  // 查詢所有數據
  findAll: async (userId) => {
    return await db.select().from(todos).where(eq(todos.userId, userId));
  },

  // 查詢單筆數據
  findById: async (id, userId) => {
    const [result] = await db
      .select()
      .from(todos)
      .where(and(eq(todos.id, id), eq(todos.userId, userId)));
    return result;
  },

  // 增加數據
  create: async (title, userId) => {
    const [newTodo] = await db
      .insert(todos)
      .values({ title, userId })
      .returning();
    return newTodo;
  },

  // 更新數據
  update: async (id, title, is_completed, userId) => {
    const [updateTodo] = await db
      .update(todos)
      .set({ title, isCompleted: is_completed })
      .where(and(eq(todos.id, id), eq(todos.userId, userId)))
      .returning();
    return updateTodo;
  },

  // 刪除
  delete: async (id, userId) => {
    const [deleted] = await db
      .delete(todos)
      .where(and(eq(todos.id, id), eq(todos.userId, userId)))
      .returning();
    return deleted;
  },
};

module.exports = todoModel;
