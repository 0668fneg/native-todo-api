const { Hono } = require("hono");
const { cors } = require("hono/cors");
const { serve } = require("@hono/node-server");
const { setCookie, getCookie } = require("hono/cookie");
const userService = require("./services/userService");
const todoService = require("./services/todoService");
const Redis = require("ioredis");
const { exportToExcel } = require("./utils/excel");

const redis = new Redis();
const generateSessionId = () => Math.random().toString(36).substring(2);

const app = new Hono();
app.use("*", cors());

// 中間件
const Middileware = async (c, next) => {
  const sessionId = getCookie(c, "session_id");
  if (!sessionId) return c.json({ error: "請先登錄" }, 401);

  const rawData = await redis.get(`session:${sessionId}`);
  if (!rawData) {
    return c.json({ error: "會話已過期,請重新錄登" }, 401);
  }
  const sessionData = JSON.parse(rawData);
  c.set("userId", sessionData.userId);
  await next();
};

// 用戶註冊
app.post("/register", async (c) => {
  try {
    const { username, password } = await c.req.json();
    const newUser = await userService.registerUser(username, password);
    return c.json({ message: "注冊成功", userId: newUser.id }, 201);
  } catch (err) {
    if (err.message === "用戶名已被使用") {
      return c.json({ error: "用戶已被注冊" }, 400);
    }
    return c.json({ error: "服務器出錯" }, 500);
  }
});

// 用戶登錄
app.post("/login", async (c) => {
  try {
    const { username, password } = await c.req.json();
    const user = await userService.loginUser(username, password);
    const sessionId = generateSessionId();
    await redis.set(
      `session:${sessionId}`,
      JSON.stringify({ userId: user.id }),
      "EX",
      86400,
    );

    setCookie(c, "session_id", sessionId, {
      path: "/",
      httpOnly: true,
      maxAge: 86400,
      sameSite: "Lax",
    });
    return c.json({ message: "登錄成功 " }, 200);
  } catch (err) {
    if (err.message === "用戶名不存在或密碼不正確") {
      return c.json({ error: "用戶名或密碼錯誤 " }, 401);
    }

    return c.json({ error: "服務器出錯" }, 500);
  }
});

app.use("/todos/*", Middileware);

// 1. 查詢全部
app.get("/todos", async (c) => {
  const userId = c.get("userId");
  try {
    const allTodos = await todoService.getAllTodos(userId);
    return c.json(allTodos, 200);
  } catch (err) {
    return c.json({ error: "服務器出錯" }, 500);
  }
});

// 2. 查詢單筆
app.get("/todos/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const userId = c.get("userId");
  if (isNaN(id)) return c.json({ error: "ID 格式無效" }, 400);
  try {
    const todo = await todoService.getTodoById(id, userId);

    return c.json(todo, 200);
  } catch (err) {
    return c.json({ error: "服務器錯誤" }, 500);
  }
});

// 3. 增加數據
app.post("/todos", async (c) => {
  const userId = c.get("userId");
  try {
    const { title } = await c.req.json();
    if (!title) return c.json({ error: "請提供 title" }, 400);
    const newTodo = await todoService.createTodo(title, userId);
    return c.json(newTodo, 201);
  } catch (err) {
    return c.json({ error: "服務器錯誤" }, 500);
  }
});

// 4. 更新數據
app.put("/todos/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const userId = c.get("userId");
  if (isNaN(id)) return c.json({ error: "ID 格式無效" }, 400);
  try {
    const { title, is_completed } = await c.req.json();
    const updateTodo = await todoService.updateTodo(
      id,
      title,
      is_completed,
      userId,
    );
    return c.json(updateTodo, 200);
  } catch (err) {
    return c.json({ error: "服務器錯誤" }, 500);
  }
});

// 5. 刪除數據
app.delete("/todos/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const userId = c.get("userId");
  if (isNaN(id)) return c.json({ error: "無效的 ID 格式" }, 400);
  try {
    await todoService.deleteTodo(id, userId);
    return c.json({ message: "刪除成功" }, 200);
  } catch (err) {
    return c.json({ error: "服務器錯誤" }, 500);
  }
});

// 6. 導出 Excel
app.get("/todos/export/excel", async (c) => {
  const userId = c.get("userId");

  try {
    const allTodos = await todoService.getAllTodos(userId);

    if (!allTodos || allTodos.length === 0) {
      return c.json({ error: "沒有數據可導出" }, 400);
    }

    const fromattedData = allTodos.map((item) => ({
      編號id: item.id,
      任務標題title: item.title,
      是否完成: item.isCompleted ? "已完成" : "未完成",
      創建時間: new Date(item.createdAt).toLocaleString(),
    }));

    const excelBuffer = exportToExcel(fromattedData, "待辦事項");
    c.header(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    c.header("Content-Disposition", 'attachment; filename="todos_export.xlsx"');
    return c.body(excelBuffer);
  } catch (err) {
    console.error("Excel 導出失敗:", err);
    return c.json({ error: "服務器錯誤" }, 500);
  }
});

serve({ fetch: app.fetch, port: 3002 }, (info) => {
  console.log(`服務器已啓動 http://localhost:${info.port}`);
});
