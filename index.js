const http = require("http");
const TodoModel = require("./todoModel");
const { error } = require("console");

const server = http.createServer(async (req, res) => {
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
          return res.end(JSON.stringify({ error: "找不到訪筆數據" }));
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
  }

  res.statusCode = 404;
  res.end(JSON.stringify({ message: "路徑不存在" }));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`服務器已啓動 http://localhost:${PORT}`);
});
