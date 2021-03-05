var express = require("express");
var router = express.Router();
const fs = require("fs");
const { required } = require("joi");
const Joi = require("joi");
const WebSocket = require("ws");
const ws = new WebSocket("ws://localhost:3000");

/* GET users listing. */
router.get("/messages", function (req, res, next) {
  let rawdata = fs.readFileSync("./data.json");
  let mensajes = JSON.parse(rawdata);
  res.send(mensajes);
});

router.get("/messages/:id", function (req, res, next) {
  let rawdata = fs.readFileSync("./data.json");
  let ts = req.params.id;
  let buscado;
  let mensajes = JSON.parse(rawdata);
  mensajes.forEach((element) => {
    if (element.ts == ts) {
      buscado = element;
    }
  });
  if (buscado == null) {
    res.sendStatus(404);
  } else {
    res.send(buscado);
  }
});

router.post("/messages/", function (req, res, next) {
  let rawdata = fs.readFileSync("./data.json");
  let object = JSON.parse(rawdata);
  console.log("Got body:", req.body);
  let newData = req.body;
  response = validateUser(newData);

  if (response.error) {
    res.send(response.error);
  } else {
    ws.send(JSON.stringify(newData));
    object.push(newData);
    fs.writeFile("./data.json", JSON.stringify(object), (err) => {
      if (err) console.log("Error writing file:", err);
    });

    res.sendStatus(200);
  }
});

router.delete("/messages/:id", function (req, res, next) {
  let rawdata = fs.readFileSync("./data.json");
  let ts = req.params.id;
  let buscado;
  let indice;
  let mensajes = JSON.parse(rawdata);
  for (let index = 0; index < mensajes.length; index++) {
    const element = mensajes[index];
    if (element.ts == ts) {
      buscado = element;
      indice = index;
    }
  }
  if (buscado == null) {
    res.sendStatus(404);
  } else {
    mensajes.splice(indice, 1);
    fs.writeFile("./data.json", JSON.stringify(mensajes), (err) => {
      if (err) console.log("Error writing file:", err);
    });
    res.sendStatus(200);
  }
});

router.put("/messages/", function (req, res, next) {
  let rawdata = fs.readFileSync("./data.json");
  let object = JSON.parse(rawdata);
  let buscado;
  console.log("Got body:", req.body);
  let newData = req.body;
  response = validateUser(newData);

  if (response.error) {
    res.send(response.error);
  } else {
    for (let index = 0; index < object.length; index++) {
      const element = object[index];
      if (element.ts == newData.ts) {
        buscado = element;
        object[index] = newData;
      }
    }
    if (buscado == null) {
      res.sendStatus(404);
    } else {
      res.sendStatus(200);
    }
    fs.writeFile("./data.json", JSON.stringify(object), (err) => {
      if (err) console.log("Error writing file:", err);
    });
  }
});

function validateUser(user) {
  const JoiSchema = Joi.object({
    author: Joi.string()
      .pattern(new RegExp("([A-zÀ-ú])\\s([A-zÀ-ú])"))
      .required(),
    message: Joi.string().required().min(5),
    ts: Joi.string().alphanum().required(),
  }).options({ abortEarly: false });

  return JoiSchema.validate(user);
}

module.exports = router;
