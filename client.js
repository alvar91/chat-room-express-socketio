const socket = io.connect("http://localhost:8080/");
let user = "";

window.onload = function () {
  const users_container = document.getElementById("userlist");
  const message_container = document.getElementById("messages");

  message_container.style.height = window.innerHeight - 200 + "px";

  const btn = document.getElementById("btn");
  const message_input = document.getElementById("inp");

  // загрузить имена пользователей, которые online
  socket.emit("load users");
  socket.on("users loaded", function (data) {
    const display_users = data.users.map((username) => {
      return `<li>${username}</li>`;
    });

    users_container.innerHTML = display_users.join(" ");
  });

  // загрузить сообщения других пользователей (при загрузке страницы)
  socket.emit("load messages");
  socket.on("messages loaded", function (data) {
    const display_messages = data.messages.map((msg) => {
      return `<div class ="panel well">
                         <h4>${msg.author}</h4>
                         <h5>${msg.text}</h5>
                    </div>`;
    });

    message_container.innerHTML = display_messages.join(" ");
  });

  // загрузить текущее сообщение
  socket.on("chat message", function (message) {
    console.log(message);
    const display_message = `<div class ="panel well">
                                   <h4>${message.author}</h4>
                                   <h5>${message.text}</h5>
                               </div>`;
    message_container.innerHTML += display_message;
  });

  // получить имя пользователя
  socket.on("new user", function (data) {
    user = data.name;
  });

  btn.onclick = function () {
    // сгенерировать событие отправки сообщения
    socket.emit("send message", { text: message_input.value, author: user });
  };
};
