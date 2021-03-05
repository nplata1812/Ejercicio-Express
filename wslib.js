const WebSocket = require("ws");
const fs = require("fs");
const clients = [];
const messages = [];
const Message = require("./models/Message");
const wsConnection = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    clients.push(ws);

    ws.on("message", (message) => {
      var convertido = JSON.parse(message);
      final = convertido.author + ": " + convertido.message;
      messages.push(final);
      Message.create({
        message: convertido.message,
        author: convertido.author,
        ts: convertido.ts,
      }).then((result) => {
        sendMessages();
        console.log("New message");
      });
    });
  });

  const sendMessages = () => {
    clients.forEach((client) => client.send(JSON.stringify(messages)));
  };
};

function jsonReader(filePath, cb) {
  fs.readFile(filePath, (err, fileData) => {
    if (err) {
      return cb && cb(err);
    }
    try {
      const object = JSON.parse(fileData);
      return cb && cb(null, object);
    } catch (err) {
      return cb && cb(err);
    }
  });
}
exports.wsConnection = wsConnection;
