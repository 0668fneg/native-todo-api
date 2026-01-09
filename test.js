const http = require("http");

const server = http.createServer(async (req, res) => {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.end("歡迎來到新民世界");
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`runing http://localhost:${PORT}`);
});
