const { Hono } = require("hono"); // 引入模組
const { cors } = require("hono/cors"); // 引入中間件
const { serve } = require("@hono/node-server"); // 引入適配器
const TodoModel = require("./todoModel");
const UserModel = require("./userModel");

// 用Hono框架創建http
const app = new Hono();

// 自動處理Header複雜的 跨域通行證
app.use("*", cors());

// 註冊新用戶
app.post("/register", async (c) => {
  // 自動解析包裹：c.req.json() 取代了原本麻煩的數據流 (Stream) 監聽
  try {
    const { username, password } = await c.req.json();

    // 等資料庫的回傳結果
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

// 登錄
app.post("/login", async (c) => {
  try {
    const { username, password } = await c.req.json();

    if (!username || !password) {
      return c.json({ error: "請完整輸入用戶名和密碼" }, 400);
    }

    const user = await UserModel.findByUsername(username);
    if (!user || user.password !== password) {
      return c.json({ message: "用戶名或密碼不正確" }, 401);
    }

    return c.json({ message: "登錄成功", userId: user.id }, 200);
  } catch (err) {
    return c.json({ error: "服務器出錯" }, 500);
  }
});

// 查詢
app.get("/todos", async (c) => {
  try {
    const userId = c.req.header("X-User-Id");
    if (!userId) {
      return c.json({ error: "請提供用戶 ID" }, 401);
    }
    const todos = await TodoModel.getAll(userId);
    return c.json(todos, 200);
  } catch (err) {
    return c.json({ error: "服務器出錯" }, 500);
  }
});

// 查詢單筆數據
app.get("/todos/:id", async (c) => {
  const id = c.req.param("id");
  const userId = c.req.header("X-User-Id");

  if (isNaN(id)) {
    return c.json({ error: "無效的id 必須爲數字" }, 400);
  }

  try {
    const todo = await TodoModel.get(id, userId);

    if (!todo) {
      return c.json({ error: "找不到該筆數據或用戶資料不對" }, 404);
    }
    return c.json(todo, 200);
  } catch (err) {
    return c.json({ error: "服務器出錯" }, 500);
  }
});

// 增加數據
app.post("/todos", async (c) => {
  const userId = c.req.header("X-User-Id");
  try {
    const { title } = await c.req.json();
    if (!title) return c.json({ error: "請提供title" }, 400);
    const newTodo = await TodoModel.create(title, userId);
    return c.json(newTodo, 201);
  } catch (err) {
    return c.json({ error: "服務器錯誤" }, 500);
  }
});

// 更新數據
app.put("/todos/:id", async (c) => {
  const id = c.req.param("id");
  const userId = c.req.header("X-User-Id");

  if (isNaN(id)) {
    return c.json({ error: "無效的id 必須爲數字" }, 400);
  }
  try {
    const { title, is_completed } = await c.req.json();
    const update = await TodoModel.update(id, title, is_completed, userId);
    if (!update) {
      return c.json({ error: "找不到該筆數據或無權限修改" }, 404);
    }
    return c.json(update, 200);
  } catch (err) {
    return c.json({ error: "服務器錯誤" }, 500);
  }
});

// 刪除數據
app.delete("/todos/:id", async (c) => {
  const id = c.req.param("id");
  const userId = c.req.header("X-User-Id");
  try {
    const deletedTodo = await TodoModel.delete(id, userId);
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
    console.log(`服務器已啓動  http://localhost: ${info.port}`);
  }
);
