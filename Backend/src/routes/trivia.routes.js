const express = require("express");
const router = express.Router();

//controllers
const triviaController = require("../controllers/trivia.controller");

// validators
const triviaValidator = require("../validators/trivia.validator");
const { test } = require("../services/gmail.service");

router.route("/create").post(triviaValidator.validateTriviaInfo, triviaController.addTrivia);

router.route("/get/trivia/:RoomCode").get(triviaController.getTrivia);

router.route("/save/attempt").post(triviaValidator.validateAttemptInfo, triviaController.addAttempt);

router.route("/manage/:adminToken").get((req, res, next) => {
  
  if(!req.params)
    return res.status(400).json({message:"REquest params are missing"});

  if(!req.params.adminToken)
    return res.status(400).json({message:"Admin token is required"});

  next();
}, triviaController.getTriviaForManagement);

router.route("/stop/:adminToken").get((req, res, next) => {
  if(!req.params)
    return res.status(400).json({message:"REquest params are missing"});

  if(!req.params.adminToken)
    return res.status(400).json({message:"Admin token is required"});

  next();
}, triviaController.stopTrivia);

router.route("/testMail").get(async (req, res) => {
  await test();
  res.status(200).json("ok");
});

module.exports = router;