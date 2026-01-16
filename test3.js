const { Hono } = require("hono");
const { cors } = require("hono/cors");
const { serve } = require("@hono/node-server");
const { setCookie, getCookie } = require("hono/cookie");
const { db } = require("./db");
const { users, todos } = require("./schema");
const { eq, and } = require("drizzle-orm");

const sessionStore = new Map();

const generateSessionId = () => Math.random().toString(36).substring(2);

const app = new Hono();

app.use("*", cors());

const Middileware = async (c, next) => {
  const sessionId = getCookie(c, "session_id");
  const sessionData = sessionStore.get(sessionId);

  if (!sessionData) {
    return c.json({ error: "請先登錄" }, 401);
  }

  c.set("userId", sessionData.userId);

  await next();
};

app.post("/register", async (c) => {
  try {
    const { username, password } = await c.req.json();

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    if (existingUser) return c.json({ error: "用戶名已被使用" }, 400);

    const [newUser] = await db
      .insert(users)
      .values({ username, password })
      .returning();
    return c.json({ message: "注冊成功", userId: newUser.id }, 201);
  } catch (err) {
    return c.json({ error: "服務器出錯" }, 500);
  }
});

app.post("/login", async (c) => {
  try {
    const { username, password } = await c.req.json();

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    if (user && user.password === password) {
      const sessionId = generateSessionId();
      sessionStore.set(sessionId, { userId: user.id });

      setCookie(c, "session_id", sessionId, {
        path: "/",
        httpOnly: true,
        maxAge: 60 * 60 * 24,
        sameSite: "Lax",
      });
      return c.json({ message: "登錄成功 " }, 200);
    }
    return c.json({ error: "用戶名或密碼錯誤 " }, 401);
  } catch (err) {
    return c.json({ error: "服務器出錯" }, 500);
  }
});

app.post("/logout", (c) => {
  const sessionId = getCookie(c, "session_id");
  if (sessionId) {
    sessionStore.delete(sessionId);
  }
  setCookie(c, "session_id", "", { path: "/", maxAge: 0 });
  return c.json({ message: "登出成功" });
});

app.use("/todos/*", Middileware);

// 1. 查詢全部
app.get("/todos", async (c) => {
  const userId = c.get("userId");
  try {
    const allTodos = await db
      .select()
      .from(todos)
      .where(eq(todos.userId, userId));
    return c.json(allTodos, 200);
  } catch (err) {
    return c.json({ error: "服務器出錯" }, 500);
  }
});

// 2. 查詢單筆
app.get("/todos/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const userId = c.get("userId");
  if (isNaN(id)) {
    return c.json({ error: "ID 格式無效" }, 400);
  }

  try {
    const [todo] = await db
      .select()
      .from(todos)
      .where(and(eq(todos.id, id), eq(todos.userId, userId)));

    if (!todo) return c.json({ error: "找不到該筆數據" }, 404);
    return c.json(todo, 200);
  } catch (err) {
    return c.json({ error: "服務器錯誤" }, 500);
  }
});

// 3.增加數據
app.post("/todos", async (c) => {
  const userId = c.get("userId");

  try {
    const { title } = await c.req.json();
    if (!title) return c.json({ error: "請提供 title" }, 400);

    const [newTodo] = await db
      .insert(todos)
      .values({ title: title, userId: userId })
      .returning();
    return c.json(newTodo, 201);
  } catch (err) {
    console.error(err);
    return c.json({ error: "服務器錯誤" }, 500);
  }
});

// 4. 更新數據
app.put("/todos/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const userId = c.get("userId");

  if (isNaN(id)) {
    return c.json({ error: "ID 格式無效" }, 400);
  }
  try {
    const { title, is_completed } = await c.req.json();

    const [updateTodo] = await db
      .update(todos)
      .set({ title, isCompleted: is_completed })
      .where(and(eq(todos.id, id), eq(todos.userId, userId)))
      .returning();

    if (!updateTodo) return c.json({ error: "修改失敗" }, 404);
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
    const [deletedTodo] = await db
      .delete(todos)
      .where(and(eq(todos.id, id), eq(todos.userId, userId)))
      .returning();
    if (!deletedTodo) {
      const [checkExist] = await db
        .select()
        .from(todos)
        .where(eq(todos.id, id));

      if (!checkExist) {
        return c.json({ error: "刪除失敗 數據不存在 " }, 404);
      } else return c.json({ error: "刪除失敗或權限不足" }, 404);
    }
    return c.json({ message: "刪除成功" }, 200);
  } catch (err) {
    return c.json({ error: "服務器錯誤" }, 500);
  }
});

serve(
  {
    fetch: app.fetch,
    port: 3002,
  },
  (info) => {
    console.log(`服務器已啓動 http://localhost:${info.port}`);
  }
);
