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

async function getTrivia(req, res) {
  try {
    //console.log(req.params);
    const {RoomCode} = req.params;


    const trivia = await triviaService.getTriviaAvailableByRoomCode(RoomCode.trim());

    if(!trivia || trivia.length === 0)
      return res.status(204).json({message:"Trivia not found"});
   // console.log(trivia[0].ID)
    const triviaQuestions = await triviaService.getTriviaQuestions(trivia[0].ID);
    //console.log(triviaQuestions)
/*
    for(let i = 0; i < questions; i++) {
      const [options] = await db.query(optionsQuery, [questions[i].questionID]);
      questions[i] = {
        ...questions[i], 
        multipleAnswers: options.filter(o => o.IsCorrect === 1).length > 1, 
        options: options.map(o => ({text: o.text, optionID: o.optionID}))
      };
    }
*/

    for(let i = 0; i < triviaQuestions.length; i++) {
      const question = triviaQuestions[i];
      const options = await triviaService.getQuestionOptions(question.ID);
      //console.log(options)

      triviaQuestions[i] = {
        ...question,
        multipleAnswers: options.filter(o => o.IsCorrect === 1).length > 1,
        options: options.map(o => ({text: o.OptionText, ID: o.ID, selected:false}))
      }
    }

    
    return res.status(200).json({
      ID: trivia[0].ID, 
      TriviaTitle: trivia[0].TriviaTitle,
      AdminName: trivia[0].AdminName, 
      questions: triviaQuestions
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({message: error.message});
  }
  
}

async function addAttempt(req, res) {
  try {
    const attempt = req.body;
// todo: validate trivia id
    const answers = [];
   // console.log(attempt)
    attempt.questions.forEach(question => {
      question.options.forEach(option => {
        if(option.selected)
          answers.push(option.ID);
      })
    });
    

    await triviaService.addAttempt({
      ...attempt, 
      ID: crypto.randomUUID(),
      answers
    });

    return res.status(201).json({message:"Trivia attempt added successfully"});
  } catch (error) {
    console.log(error);
    return res.status(500).json({message: error.message});    
  }
}


async function getTriviaByAdminToken(req, res) {
  try {
    const {adminToken} = req.params;

    const trivia = await triviaService.getTriviaByAdminToken(adminToken);
    if(trivia.length === 0)
      return res.status(404).json({message:"Trivia not found"});
    return res.status(200).json(trivia[0]);
  } catch (error) {
    console.log(error);
    return res.status(500).json({message: error.message});    
  }
}


module.exports = {addTrivia, getTrivia, addAttempt, getTriviaByAdminToken};