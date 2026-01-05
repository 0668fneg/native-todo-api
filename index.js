const http = require("http");
const TodoModel = require("./todoModel");
const UserModel = require("./userModel");

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  // 授權 X-User-Id
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-User-Id");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }

  // 提取 Body 解析邏輯做中間層，避免每個 POST 和 PUT 都寫一次解查邏輯。
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", async () => {
    // 從 Header 統一提取 user_id
    const userIdFromHeader = req.headers["x-user-id"];

    let data = {};
    try {
      if (body) {
        data = JSON.parse(body);
      }
    } catch (e) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: "無效的 JSON 格式" }));
    }

    //定義公共路由
    const isPublicRoute =
      (req.url === "/register" || req.url === "/login") &&
      req.method === "POST";
    //檢查 Header 是否提供 ID
    if (!isPublicRoute) {
      if (!userIdFromHeader) {
        res.statusCode = 401;
        return res.end(JSON.stringify({ error: "未提供 user-id" }));
      }

      //校驗 ID 是否真實存在數據庫
      try {
        const user = await UserModel.findById(userIdFromHeader);
        if (!user) {
          res.statusCode = 403;
          return res.end(JSON.stringify({ error: "用戶不存在" }));
        }
        req.authenticatedUser = user;
      } catch (err) {
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: "服務器出錯" }));
      }
    }

    // 注冊用戶 POST /register
    if (req.url === "/register" && req.method === "POST") {
      const { username, password } = data;

      //1 驗證注冊輸入信息
      if (!username || !password) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: "用戶名和密碼不能爲空" }));
      }

      try {
        const existingUser = await UserModel.findByUsername(username);
        if (existingUser) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: "用戶名已被注冊" }));
        }
        // 將監聽日志刪除
        const newUser = await UserModel.create(username, password);
        res.statusCode = 201;
        return res.end(
          JSON.stringify({
            message: "注冊成功",
            user: { id: newUser.id, username: newUser.username },
          })
        );
      } catch (err) {
        console.error("出錯具體原因", err);
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: "服務器出錯" }));
      }
    }

    // 登录 POST /login
    if (req.url === "/login" && req.method === "POST") {
      const { username, password } = data;

      if (!username || !password) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: "請輸入用戶名和密碼" }));
      }

      try {
        const user = await UserModel.findByUsername(username);
        if (user && user.password === password) {
          res.statusCode = 200;
          return res.end(
            JSON.stringify({ message: "登錄成功", userId: user.id })
          );
        } else {
          res.statusCode = 401;
          return res.end(JSON.stringify({ error: "用戶名或密碼錯誤" }));
        }
      } catch (err) {
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: "服務器出錯" }));
      }
    }

    // 查詢所有數據  GET /todos
    if (req.url === "/todos" && req.method === "GET") {
      try {
        const todos = await TodoModel.getAll(userIdFromHeader);
        res.statusCode = 200;
        return res.end(JSON.stringify(todos));
      } catch (err) {
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: "數據庫讀取失敗" }));
      }

      // 查詢單個數據 GET /todos/:id
    } else if (req.url.startsWith("/todos/") && req.method === "GET") {
      const id = req.url.split("/")[2];
      if (isNaN(id)) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: "無效的ID,必須爲數字" }));
      }

      try {
        const todo = await TodoModel.get(id, userIdFromHeader);
        if (!todo) {
          res.statusCode = 404;
          return res.end(
            JSON.stringify({ error: "找不到該筆數據或用戶資料不對" })
          );
        }
        res.statusCode = 200;
        return res.end(JSON.stringify(todo));
      } catch (err) {
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: "查詢失敗" }));
      }

      // 增加數據 POST /todos
    } else if (req.url === "/todos" && req.method === "POST") {
      const { title } = data;

      if (!title) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: "請提供title" }));
      }
      try {
        const newTodo = await TodoModel.create(title, userIdFromHeader);
        res.statusCode = 201;
        return res.end(JSON.stringify(newTodo));
      } catch (err) {
        console.error("具體錯誤信息", err);
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: "新增失敗 " }));
      }
    }

    // 更新數據 PUT / todos/:id
    else if (req.url.startsWith("/todos/") && req.method === "PUT") {
      const id = req.url.split("/")[2];

      if (isNaN(id)) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: "無效的ID,必須爲數字" }));
      }

      const { title, is_completed } = data;

      try {
        const updateTodo = await TodoModel.update(
          id,
          title,
          is_completed,
          userIdFromHeader
        );
        if (!updateTodo) {
          res.statusCode = 404;
          return res.end(
            JSON.stringify({ error: "找不到該筆數據或者無權限修改" })
          );
        }
        res.statusCode = 200;
        return res.end(JSON.stringify(updateTodo));
      } catch (err) {
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: "更新失敗" }));
      }
    }
    // 刪除數據 DELETE /todos/:id
    else if (req.url.startsWith("/todos/") && req.method === "DELETE") {
      const id = req.url.split("/")[2];
      if (isNaN(id)) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: "無效的ID,必須爲數字" }));
      }

      try {
        const deletedTodo = await TodoModel.delete(id, userIdFromHeader);

        if (!deletedTodo) {
          res.statusCode = 404;
          return res.end(JSON.stringify({ error: "找不到該筆數據，無法刪除" }));
        }
        res.statusCode = 204;
        return res.end();
      } catch (err) {
        res.statusCode = 500;
        console.error("具體錯誤信息", err);
        console.log("測試中");
        console.log("測試有衝突代碼，如何解決衝突");
        return res.end(JSON.stringify({ error: "刪除失敗" }));
      }
    } else {
      res.statusCode = 404;
      return res.end(JSON.stringify({ message: "路徑不存在" }));
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`服務器已啓動 http://localhost:${PORT}`);
});
