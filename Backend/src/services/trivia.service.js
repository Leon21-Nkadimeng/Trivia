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

async function getTriviaByAdminToken(adminToken) {
  const [trivia] = await db.query('SELECT * FROM Trivia WHERE AdminToken = ?', [adminToken]);
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
  const [trivia] = await db.query('SELECT * FROM Trivia WHERE ID = ?', [triviaID]);
  return trivia;
}

async function startTrivia(adminToken) {
  await db.query('UPDATE Trivia SET Status = "Open", DateStarted = NOW() WHERE AdminToken = ?', [adminToken]);
}

async function stopTrivia(adminToken) {
  await db.query('UPDATE Trivia SET Status = "Closed", DateClosed = NOW() WHERE AdminToken = ?', [adminToken]);
}


async function getTriviaDetailsForManagement(adminToken) {
  const SQL = `
    SELECT Trivia.ID as triviaID, Trivia.TriviaTitle, Trivia.Status, Trivia.AdminName, Trivia.RoomCode, COUNT(DISTINCT Question.ID) as questions, COUNT(DISTINCT Trivia_Attempt.ID) as participants
    FROM Trivia LEFT JOIN Question ON Question.TriviaID = Trivia.ID
    LEFT JOIN Trivia_Attempt on Trivia.ID = Trivia_Attempt.TriviaID
    WHERE Trivia.AdminToken = ?
    GROUP BY
        Trivia.ID,
        Trivia.TriviaTitle,
        Trivia.AdminName,
        Trivia.RoomCode
  `
  const [data] = await db.query(SQL, [adminToken]);
  return data;
}

async function getLeaderboard(adminToken) {
  const SQL = `
  SELECT
	TIMESTAMPDIFF(MICROSECOND, Trivia_Attempt.DateStarted, Trivia_Attempt.DateSubmitted) / 6000000.0 as attempt_time_minutes, 
    Trivia_Attempt.AttemptName, sum(u.IsCorrect) as correct_answers
  FROM Trivia_Attempt 
  inner join Trivia on Trivia.ID = Trivia_Attempt.TriviaID
  inner join Selected_Option on Selected_Option.AttemptID = Trivia_Attempt.ID
  inner join (select ID, IsCorrect from Question_Option) as u on u.ID = Selected_Option.OptionID
  WHERE Trivia.AdminToken = ?
  GROUP BY
      Trivia_Attempt.ID,
      Trivia_Attempt.AttemptName,
      Trivia_Attempt.DateStarted,
      Trivia_Attempt.DateSubmitted
  ORDER BY correct_answers DESC, attempt_time_minutes ASC
  `

  const [data] = await db.query(SQL, [adminToken]);
  return data;
}
module.exports= {addTrivia, getTriviaQuestions, getTriviaByRoomCode, getQuestionOptions, getTriviaAvailableByRoomCode, addAttempt, getTriviaByTriviaID, getTriviaByAdminToken, startTrivia, stopTrivia, getLeaderboard, getTriviaDetailsForManagement};