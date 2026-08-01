const express = require("express");
const router = express.Router();

//controllers
const triviaController = require("../controllers/trivia.controller");

// validators
const triviaValidator = require("../validators/trivia.validator");

router.route("/create").post(triviaValidator.validateTriviaInfo, triviaController.addTrivia);

module.exports = router;