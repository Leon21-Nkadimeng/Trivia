const triviaService = require("../services/trivia.service");

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

async function generateRoomCode() {
  let code = '';
  while(true) {
    
    for(let i = 0; i < 7; i++) {
      const random = Math.floor(Math.random() * characters.length) + 1;
      code += characters.charAt(random);
    }

    const trivia = await triviaService.getTriviaByRoomCode(code);
    //console.log(trivia);
    if(trivia.length === 0)
      return code;
    
    code ='';
  }

  
}


module.exports = {generateRoomCode};