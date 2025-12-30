const http = require("http");
const TodoModel = require("./todoModel");

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
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
    let data = {};
    try {
      if (body) {
        data = JSON.parse(body);
      }
    } catch (e) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: "無效的 JSON 格式" }));
    }

    // 查詢所有數據  GET /todos
    if (req.url === "/todos" && req.method === "GET") {
      try {
        const todos = await TodoModel.getAll();
        res.statusCode = 200;
        return res.end(JSON.stringify(todos));
      } catch (err) {
        console.error("具體錯誤信息", err);
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
        const todo = await TodoModel.get(id);
        if (!todo) {
          res.statusCode = 404;
          return res.end(JSON.stringify({ error: "找不到該筆數據" }));
        }
        res.statusCode = 200;
        return res.end(JSON.stringify(todo));
      } catch (err) {
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: "查詢失敗" }));
      }

      // 增加數據 POST /todos
    } else if (req.url === "/todos" && req.method === "POST") {
      const { title, user_id } = data;
      if (!title || !user_id) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: "請提供title" }));
      }
      try {
        const newTodo = await TodoModel.create(title, user_id);
        res.statusCode = 201;
        return res.end(JSON.stringify(newTodo));
      } catch (err) {
        console.log("具體錯誤信息", err);
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
        const updateTodo = await TodoModel.update(id, title, is_completed);
        if (!updateTodo) {
          res.statusCode = 404;
          return res.end(JSON.stringify({ error: "找不到該筆數據" }));
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
        const deletedTodo = await TodoModel.delete(id);

        if (!deletedTodo) {
          res.statusCode = 404;
          return res.end(JSON.stringify({ error: "找不到該筆數據，無法刪除" }));
        }
        res.statusCode = 204;
        return res.end();
      } catch (err) {
        res.statusCode = 500;
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
