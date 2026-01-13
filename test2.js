const { Hono } = require("hono");
const { cors } = require("hono/cors");
const { serve } = require("@hono/node-server");
const { setCookie, getCookie } = require("hono/cookie");
const TodoModel = require("./todoModel");
const UserModel = require("./userModel");

// 伺服器的「保險箱」，存儲 sessionId -> { userId } 的對應關係
const sessionStore = new Map();

// 生成隨機 sessionId 的工具
const generateSessionId = () => Math.random().toString(36).substring(2);

const app = new Hono();

app.use("*", cors());

app.post("/register", async (c) => {
  try {
    const { username, password } = await c.req.json();
    const existingUser = await UserModel.findByUsername(username);
    if (existingUser) {
      return c.json({ error: "用戶名已被使用" }, 400);
    }
    const newUser = await UserModel.create(username, password);
    return c.json({ message: "注冊成功", userId: newUser.id }, 201);
  } catch (err) {
    return c.json({ error: "服務器出錯" }, 500);
  }
});

app.post("/login", async (c) => {
  try {
    const { username, password } = await c.req.json();
    const user = await UserModel.findByUsername(username);

    if (user && user.password === password) {
      // 隨機生成 sessionId
      const sessionId = generateSessionId();
      // 將userId 存到服務器 Map
      sessionStore.set(sessionId, { userId: user.id });

      // 將隨機編號存入客戶端 Cookie
      setCookie(c, "session_id", sessionId, {
        path: "/",
        httpOnly: true,
        maxAge: 60 * 60 * 24,
        sameSite: "Lax",
      });

      return c.json({ message: "登錄成功" }, 200);
    }
    return c.json({ error: "用戶名或密碼錯誤" }, 401);
  } catch (err) {
    return c.json({ error: "服務器出錯" }, 500);
  }
});

// 1. 查詢全部
app.get("/todos", async (c) => {
  // 拿到sessionId
  const sessionId = getCookie(c, "session_id");
  // 查找存在服務器sessionId 對應的 userId
  const sessionData = sessionStore.get(sessionId);

  if (!sessionData) {
    return c.json({ error: "未登錄或 Session 已過期" }, 401);
  }

  try {
    const todos = await TodoModel.getAll(sessionData.userId);
    return c.json(todos, 200);
  } catch (err) {
    return c.json({ error: "服務器出錯" }, 500);
  }
});

// 2. 查詢單筆
app.get("/todos/:id", async (c) => {
  const id = c.req.param("id");
  const sessionId = getCookie(c, "session_id");
  const sessionData = sessionStore.get(sessionId);

  if (!sessionData) {
    return c.json({ error: "未登錄" }, 401);
  }

  if (isNaN(id)) {
    return c.json({ error: "無效的 id 必須為數字" }, 400);
  }

  try {
    const todo = await TodoModel.get(id, sessionData.userId);
    if (!todo) {
      return c.json({ error: "找不到該筆數據或權限不足" }, 404);
    }
    return c.json(todo, 200);
  } catch (err) {
    return c.json({ error: "服務器出錯" }, 500);
  }
});

// 3. 增加數據
app.post("/todos", async (c) => {
  const sessionId = getCookie(c, "session_id");
  const sessionData = sessionStore.get(sessionId);

  if (!sessionData) {
    return c.json({ error: "未登錄" }, 401);
  }

  try {
    const { title } = await c.req.json();
    if (!title) return c.json({ error: "請提供 title" }, 400);

    const newTodo = await TodoModel.create(title, sessionData.userId);
    return c.json(newTodo, 201);
  } catch (err) {
    return c.json({ error: "服務器錯誤" }, 500);
  }
});

// 4. 更新數據
app.put("/todos/:id", async (c) => {
  const id = c.req.param("id");
  const sessionId = getCookie(c, "session_id");
  const sessionData = sessionStore.get(sessionId);

  if (!sessionData) {
    return c.json({ error: "未登錄" }, 401);
  }

  if (isNaN(id)) {
    return c.json({ error: "無效的 id 必須為數字" }, 400);
  }

  try {
    const { title, is_completed } = await c.req.json();
    const update = await TodoModel.update(
      id,
      title,
      is_completed,
      sessionData.userId
    );
    if (!update) {
      return c.json({ error: "修改失敗，可能數據不存在" }, 404);
    }
    return c.json(update, 200);
  } catch (err) {
    return c.json({ error: "服務器錯誤" }, 500);
  }
});

// 5. 刪除數據
app.delete("/todos/:id", async (c) => {
  const id = c.req.param("id");
  const sessionId = getCookie(c, "session_id");
  const sessionData = sessionStore.get(sessionId);

  if (!sessionData) {
    return c.json({ error: "未登錄或 Session 過期" }, 401);
  }

  if (isNaN(id)) {
    return c.json({ error: "ID 格式錯誤" }, 400);
  }

  try {
    const deletedTodo = await TodoModel.delete(id, sessionData.userId);
    if (!deletedTodo) {
      return c.json({ error: "刪除失敗" }, 404);
    }
    return c.json(null, 204);
  } catch (err) {
    return c.json({ error: "服務器錯誤" }, 500);
  }
});

serve(
  {
    fetch: app.fetch,
    port: 3001,
  },
  (info) => {
    console.log(`服務器已啓動 http://localhost:${info.port}`);
  }
);
