const utils = require("../utils/trivia.utils");
const triviaService = require("../services/trivia.service");
const crypto = require("crypto");

async function addTrivia(req, res) {
  try {
    let {AdminName, triviaTitle, Email, questions} = req.body;

    const RoomCode = await utils.generateRoomCode();
    const AdminToken = crypto.randomUUID();
    await triviaService.addTrivia({
      triviaID: crypto.randomUUID(),
      triviaTitle,
      AdminName,
      Email,
      AdminToken,
      RoomCode,
      questions: questions.map(question => ({
        questionID: crypto.randomUUID(),
        text: question.text,
        options: question.options.map(option => ({
          optionID: crypto.randomUUID(),
          text: option.text,
          isCorrect: option.isCorrect ? 1 : 0
        }))
      }))
    })
    return res.status(201).json({message:`Trivia created successfully`, RoomCode, AdminToken});
  } catch (error) {
    console.log(error);
    return res.status(500).json({message: error.message});
  }
}


module.exports = {addTrivia};