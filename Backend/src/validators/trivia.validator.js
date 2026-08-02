const triviaService = require("../services/trivia.service");
function validateTriviaInfo(req, res, next) {
  try {
    // check if all fields are provided
    if(!req.body)
      return res.status(400).json({message:"No information about trivia is provided."});
    //console.log(req.body);
    const requestBody = req.body;
   
    if(!requestBody.AdminName || !requestBody.Email || !requestBody.triviaTitle || !requestBody.questions || requestBody.questions.length === 0) {
      return res.status(400).json({message:"Missing information."});
    }

    // validate email format
    const emailRegex = "^[a-zA-Z0-9!\.*&#+=_\-]+@([a-zA-Z0-9])[\.a-zA-Z0-9]*$";
    const regexContructor = new RegExp(emailRegex);
    if(!regexContructor.test(requestBody.Email))
      return res.status(400).json({message:"Invalid email address format"});

    // validate the question options
    const questions = requestBody.questions;
    for(let i = 0; i < questions.length; i++) {
      if(!questions[i].text) {
        return res.status(400).json({message:`Question ${i + 1} has no text`});
      }
      const options = questions[i].options;
      //console.log(options)
      //console.log(options);
      if(!options)
        return res.status(400).json({message:`Question ${i + 1} is missing options`});

      // validate the options
      if(options.length < 2)
        return res.status(400).json({message:`Question ${i + 1} must have at least 2 options`});

      for(let j = 0; j < options.length; j++) {
        if(!options[j].text)
          return res.status(400).json({message:"Option is missing text"});
      }

      // fint at least one correct option
      const correctOptions = options.find(o => o.isCorrect === true);

      if(!correctOptions)
        return res.status(400).json({message:`Question ${i + 1} has no answer or answers`});
        
    }
    next();
  }catch(error) {
    console.log(error);
    return res.status(500).json({message:error.message})
  }
}


async function validateAttemptInfo(req, res, next) {

  try {
    // check if all fields are provided
    if(!req.body)
      return res.status(400).json({message:"No information about trivia is provided."});

    const requestBody = req.body;

    if(!requestBody.DateStarted || !requestBody.TriviaID || !requestBody.AttemptName || !requestBody.questions || requestBody.questions.length === 0) {
      return res.status(400).json({message:"Missing trivia information."});
    }

    // validate the trivia id
    const data = await triviaService.getTriviaByTriviaID(requestBody.TriviaID);

    if(!data || data.length === 0) {
      return res.status(204).json({message:"Trivia not found"});
    }

    if(data[0].Status === 'Closed')
      return res.status(400).json({message:"Cannot participate in trivia. Trivia is closed."});

    // validate the questions and options
    const questions = requestBody.questions;
    for(let q = 0; q < questions.length; q++) {
      const options = questions[q].options;
      if(!options || options.length === 0)
        return res.status(400).json({message:"Invalid questions format"});
      const correctOption = options.find(o => o.selected === true);
      if(!correctOption)
        return res.status(400).json({message:`No selected option is found on question ${q + 1}`})
    }


    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({message:error.message})
  }
}


module.exports = {validateTriviaInfo, validateAttemptInfo};