const WebSocket = require("ws");
const fs = require("fs");
const clients = [];
const messages = [];
const wsConnection = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    clients.push(ws);

    ws.on("message", (message) => {
      var convertido = JSON.parse(message);
      final = convertido.author + ": " + convertido.message;
      messages.push(final);
      var newData = JSON.parse(message);
      jsonReader("./data.json", (err, data) => {
        if (err) {
          console.log("Error reading file:", err);
          return;
        }
        data.push(newData);
        fs.writeFile("./data.json", JSON.stringify(data), (err) => {
          if (err) console.log("Error writing file:", err);
        });
      });
      sendMessages();
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
