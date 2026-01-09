const { Hono } = require("hono"); // 引入模組
const { cors } = require("hono/cors"); // 引入中間件
const { server } = require("@hono/node-server"); // 引入適配器
const TodoModel = require("./todoModel");
const UserModel = require("./userModel");

// 用Hono框架創建http
const app = new Hono();

// 自動處理Header複雜的 跨域通行證
app.use("*", cors());

// 註冊新用戶
app.post("/register", async (c) => {
  // 自動解析包裹：c.req.json() 取代了原本麻煩的數據流 (Stream) 監聽
  const { username, password } = await c.req.json();

  // 等資料庫的回傳結果
  const existingUser = await UserModel.findByUsername(username);

  if (existingUser) {
    return c.json({ error: "用戶名已被使用" }, 400);
  }

  const newUser = await UserModel.create(username, password);
  return c.json({ message: "注冊成功" }, 201);
});
