const { pgTable, serial, varchar, boolean, timestamp, integer } = require("drizzle-orm/pg-core");

-- 1. 定義 主鍵 users 表
const users = pgTable("users", {
  id: serial("id").primaryKey(), --自動增序主鍵
  username: varchar("username", { length: 50 }).unique().notNull(), -- 唯一約束，不能爲空
  password: varchar("password", { length: 255 }).notNull(), 
});

-- 外鍵表
const todos = pgTable("todos", {
  id: serial("id").primaryKey(), -- 主鍵 自動增序
  title: varchar("title", { length: 255 }).notNull(), 
  isCompleted: boolean("is_completed").default(false), --布林值，默認爲false
  createdAt: timestamp("created_at").defaultNow(), -- 自動填入創建的時間
  userId: integer("user_id") 
    .notNull()
    .references(() => users.id), --整數，不能爲空，關聯user_id
});

module.exports = { users, todos };



