const http = require("http");

const server = http.createServer(async (req, res) => {
  res.end("Hollo Word!");
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`runing ${PORT}`);
});
