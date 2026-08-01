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
    const emailRegex = "^([a-zA-Z0-9!\.*&#+=_\-])+@([a-zA-Z0-9])[\.a-zA-Z0-9]+$";
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


module.exports = {validateTriviaInfo};