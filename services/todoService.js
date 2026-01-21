const todoModel = require("../models/todoModel");

const todoService = {
  // 獲取所有待辦事項
  getAllTodos: async (userId) => {
    // 這裡可以加業務邏輯：例如檢查用戶權限、緩存邏輯等
    return await todoModel.findAll(userId);
  },

  // 獲取單筆
  getTodoById: async (id, userId) => {
    const todo = await todoModel.findById(id, userId);
    if (!todo) throw new Error("找不到該筆數據");
    return todo;
  },

  // 創建
  createTodo: async (title, userId) => {
    if (!title || title.trim() === "") throw new Error("請提供標題");
    return await todoModel.create(title, userId);
  },

  // 更新
  updateTodo: async (id, title, is_completed, userId) => {
    const updated = await todoModel.update(id, title, is_completed, userId);
    if (!updated) throw new Error("修改失敗或權限不足");
    return updated;
  },

  // 刪除
  deleteTodo: async (id, userId) => {
    const deleted = await todoModel.delete(id, userId);
    if (!deleted) throw new Error("刪除失敗或權限不足");
    return deleted;
  },
};

module.exports = todoService;
