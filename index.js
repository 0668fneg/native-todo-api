const http = require("http");
const TodoModel = require("./todoModel");

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }
  res.setHeader("Content-Type", "application/json");

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
  } else if (req.url === "/todos" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        const title = data.title;

        if (!title) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: "請提供title" }));
        }

        const newTodo = await TodoModel.create(title);
        res.statusCode = 201;
        return res.end(JSON.stringify(newTodo));
      } catch (err) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: "無效數據" }));
      }
    });
    return;
  } else if (req.url.startsWith("/todos/") && req.method === "PUT") {
    const id = req.url.split("/")[2];
    if (isNaN(id)) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: "無效的ID,必須爲數字" }));
    }

    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", async () => {
      try {
        const { title, is_completed } = JSON.parse(body);
        const updateTodo = await TodoModel.update(id, title, is_completed);

        if (!updateTodo) {
          res.statusCode = 404;
          return res.end(JSON.stringify({ error: "找不到該筆數據" }));
        }
        res.statusCode = 200;
        return res.end(JSON.stringify(updateTodo));
      } catch (err) {
        console.error("具體錯誤信息", err);
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: "更新失敗" }));
      }
    });
    return;
  } else if (req.url.startsWith("/todos/") && req.method === "DELETE") {
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
  }

  res.statusCode = 404;
  res.end(JSON.stringify({ message: "路徑不存在" }));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`服務器已啓動 http://localhost:${PORT}`);
});
