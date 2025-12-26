const http = require("http");
const TodoModel = require("./todoModel");

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
  }

  res.statusCode = 404;
  res.end(JSON.stringify({ message: "路徑不存在" }));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`服務器已啓動 http://localhost:${PORT}`);
});
