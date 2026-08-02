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

async function getTriviaAvailableByRoomCode(roomCode) {
  const [trivia] = await db.query('SELECT * FROM Trivia WHERE RoomCode = ? AND Status ="Open"', [roomCode]);
  return trivia;
}

async function getTriviaQuestions(triviaID) {
  const questionsQuery = `
  SELECT ID, QuestionText FROM Question where TriviaID = ?
  `;

  const [questions] = await db.query(questionsQuery, [triviaID]);
  return questions;
}


async function getQuestionOptions(questionID) {

  const optionsQuery = `
  SELECT ID, OptionText, IsCorrect FROM Question_Option WHERE QuestionID = ?
  `;

  const [options] = await db.query(optionsQuery, [questionID]);
  return options;
}

async function addAttempt(attempt) {
  // get a connection from the pool
  const connection = await db.getConnection();

  try {
    // begin transaction
    await connection.beginTransaction();


    const attemptSQL = 'INSERT INTO Trivia_Attempt (ID, TriviaID, AttemptName, DateStarted, DateSubmitted) VALUES (?, ?, ?, ?, ?)';
    await connection.query(attemptSQL, [attempt.ID, attempt.TriviaID, attempt.AttemptName, attempt.DateStarted, attempt.FinishDateTime]);

    const selectedOptionSQL = 'INSERT INTO Selected_Option (AttemptID, OptionID) VALUES (?, ?)';
    const answers = attempt.answers;
    for(let i = 0; i < answers.length; i++) {
      await connection.query(selectedOptionSQL, [attempt.ID, answers[i]]);
    }

    // commit changes to the database
    await connection.commit();
  } catch (error) {
    throw error;
    await connection.rollback();
  } finally {
    connection.release();
  }
}

async function getTriviaByTriviaID(triviaID) {
  const [trivia] = await db.query('SELECT ID, Status FROM Trivia WHERE ID = ?', [triviaID]);
  return trivia;
}

module.exports= {addTrivia, getTriviaQuestions, getTriviaByRoomCode, getQuestionOptions, getTriviaAvailableByRoomCode, addAttempt, getTriviaByTriviaID};