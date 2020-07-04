// подключение express и socket.io
const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const path = require("path");

const port = 8080;

// массив для хранения текущих подключений
const connections = [];
// массив для хранения текущих пользователей
const users = [];
// массив для хранения текущих сообщений
const messages = [];

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "auth.html"));
});

app.get("/:id", function (req, res) {
  if (req.params.id == "client.js") {
    res.sendFile(path.join(__dirname, "client.js"));
  } else if (req.params.id == "favicon.ico") {
    res.sendStatus(404);
  } else {
    users.push(req.params.id);
    res.sendFile(path.join(__dirname, "index.html"));
  }
});

// установка соединения
io.on("connection", function (socket) {
  connections.push(socket);
  console.log(users);
  console.log("Connected: %s sockets connected", connections.length);

  // окончание соединения
  socket.on("disconnect", function (data) {
    const index = connections.indexOf(socket);

    // удалить разорванное соединение из списка текущих соединений
    const deletedItem = connections.splice(index, 1);

    // удалить пользователя из массива текущих пользователей
    users.splice(index, 1);

    // обновить список пользователей на клиенте
    io.sockets.emit("users loaded", { users: users });

    console.log("Disconnected: %s sockets connected", connections.length);
  });

  // обработка сообщения
  socket.on("send message", function (data) {
    // сохранить сообщение
    messages.push(data);

    // сгенерировать событие chat message и отправить его всем доступным подключениям
    io.sockets.emit("chat message", data);
  });

  // загрузить пользователей
  socket.on("load users", function () {
    console.log(users);
    io.sockets.emit("users loaded", { users: users });
  });

  // загрузить сообщения
  socket.on("load messages", function () {
    socket.emit("messages loaded", { messages: messages });
  });

  // добавить нового пользователя в чат
  socket.emit("new user", { name: users[users.length - 1] });
});

server.listen(port, function () {
  console.log("app running on port " + port);
});
