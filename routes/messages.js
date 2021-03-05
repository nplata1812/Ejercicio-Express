var express = require("express");
var router = express.Router();
const fs = require("fs");
const { required } = require("joi");
const Joi = require("joi");
const WebSocket = require("ws");
const ws = new WebSocket("ws://localhost:3000");
const Message = require("../models/Message");

/* GET users listing. */
router.get("/messages", function (req, res, next) {
  Message.findAll().then((result) => {
    res.send(result);
  });
});

router.get("/messages/:id", function (req, res, next) {
  Message.findOne({ where: { ts: req.params.id } }).then((response) => {
    if (response === null)
      return res
        .status(404)
        .send("The client with the given id was not found.");
    res.send(response);
  });
});

router.post("/messages/", function (req, res, next) {
  const { error } = validateUser(req.body);

  if (error) {
    return res.status(400).send(error);
  }

  Message.create({
    message: req.body.message,
    author: req.body.author,
    ts: req.body.ts,
  }).then((result) => {
    ws.send(JSON.stringify(result));
    res.send(result);
  });
});

router.delete("/messages/:id", function (req, res, next) {
  id = req.params.id;
  Message.destroy({
    where: {
      ts: id,
    },
  }).then((count) => {
    if (!count) {
      return res.status(404).send({ error: "No Message with id" });
    }
    res.status(204).send();
  });
});

router.put("/messages/", function (req, res, next) {
  Message.update(
    { message: req.body.message },
    {
      where: {
        ts: req.body.ts,
      },
    }
  ).then((count) => {
    if (!count) {
      return res.status(404).send({ error: "No Message with id" });
    }
    res.status(204).send();
  });
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
