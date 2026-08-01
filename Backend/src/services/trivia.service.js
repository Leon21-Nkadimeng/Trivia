const db = require("../config/database");


async function addTrivia(trivia) {
  const connection = await db.getConnection();

  try {
    connection.beginTransaction();

    const triviaSQL = 'INSERT INTO Trivia (ID, TriviaTitle, AdminName, Email, AdminToken, RoomCode, Status) VALUES (?, ?, ?, ?, ?, ?, "Open")';

    // add a trivia
    await connection.query(triviaSQL, [trivia.triviaID, trivia.triviaTitle, trivia.AdminName, trivia.Email, trivia.AdminToken, trivia.RoomCode]);

    // add the questions
    const questionSQL = 'INSERT INTO Question (ID, TriviaID, QuestionText) VALUES (?,?,?)';
    const optionSQL = 'INSERT INTO Question_Option (ID, QuestionID, OptionText, IsCorrect) VALUES (?, ?, ?, ?)';
    for(let i = 0; i < trivia.questions.length; i++) {
      // add the question
      const question = trivia.questions[i];
      await connection.query(questionSQL, [question.questionID, trivia.triviaID, question.text]);
    
      for(let j = 0; j < trivia.questions[i].options.length; j++) {
        const option = trivia.questions[i].options[j];
        await connection.query(optionSQL, [option.optionID, question.questionID, option.text, option.isCorrect]);
      }
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

}


async function getTriviaByRoomCode(roomCode) {
  const [trivia] = await db.query('SELECT * FROM Trivia WHERE RoomCode = ?', [roomCode]);
  return trivia;
}

module.exports= {addTrivia, getTriviaByRoomCode};