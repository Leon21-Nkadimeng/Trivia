// Mock the database module
jest.mock("../src/config/database");

const db = require("../src/config/database");
const { getTrivia } = require("../src/controllers/trivia.controller");
const { addTrivia, addAttempt, getTriviaByRoomCode, getTriviaByAdminToken, getTriviaAvailableByRoomCode, getTriviaDetailsForManagement, getLeaderboard, stopTrivia } = require("../src/services/trivia.service");

describe("Trivia Service", () => {

    let connection;

    // Sample trivia data
    const trivia = {
        triviaID: "trivia-123",
        triviaTitle: "Computer Science Trivia",
        AdminName: "Leon",
        Email: "test@example.com",
        AdminToken: "admin-123",
        RoomCode: "ABC123",

        questions: [
            {
                questionID: "question-123",
                text: "What is 2 + 2?",

                options: [
                    {
                        optionID: "option-1",
                        text: "4",
                        isCorrect: 1
                    },
                    {
                        optionID: "option-2",
                        text: "5",
                        isCorrect: 0
                    }
                ]
            }
        ]
    };

    beforeEach(() => {

        // Create a mock database connection
        connection = {
            beginTransaction: jest.fn(),
            query: jest.fn(),
            commit: jest.fn(),
            rollback: jest.fn(),
            release: jest.fn()
        };

        // Mock the connection pool
        db.getConnection.mockResolvedValue(connection);

    });

    afterEach(() => {
        jest.clearAllMocks();
    });


    describe("addTrivia()", () => {

        test("should successfully create a trivia and commit the transaction", async () => {

            await addTrivia(trivia);

            // Verify database connection
            expect(db.getConnection).toHaveBeenCalledTimes(1);

            // Verify transaction started
            expect(connection.beginTransaction).toHaveBeenCalledTimes(1);

            // Trivia + question + 2 options
            expect(connection.query).toHaveBeenCalledTimes(4);
            
            // verify the first trivia insert
            expect(connection.query).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining("INSERT INTO Trivia"),
                [
                    trivia.triviaID,
                    trivia.triviaTitle,
                    trivia.AdminName,
                    trivia.Email,
                    trivia.AdminToken,
                    trivia.RoomCode
                ]
            );


            // verify the second trivia insert (question insert)
            expect(connection.query).toHaveBeenNthCalledWith(
                2,
                expect.stringContaining("INSERT INTO Question"),
                [
                    trivia.questions[0].questionID,
                    trivia.triviaID,
                    trivia.questions[0].text
                ]
            );

            // verify the third trivia insert (insertion of the first option)
            expect(connection.query).toHaveBeenNthCalledWith(
                3,
                expect.stringContaining("INSERT INTO Question_Option"),
                [
                    trivia.questions[0].options[0].optionID,
                    trivia.questions[0].questionID,
                    trivia.questions[0].options[0].text,
                    trivia.questions[0].options[0].isCorrect
                ]
            );
            // verify the second option (the fourth insert)
            expect(connection.query).toHaveBeenNthCalledWith(
                4,
                expect.stringContaining("INSERT INTO Question_Option"),
                [
                    trivia.questions[0].options[1].optionID,
                    trivia.questions[0].questionID,
                    trivia.questions[0].options[1].text,
                    trivia.questions[0].options[1].isCorrect
                ]
            );


            // Verify transaction committed
            expect(connection.commit).toHaveBeenCalled();

            // No rollback should occur
            expect(connection.rollback).not.toHaveBeenCalled();

            // Verify connection released
            expect(connection.release).toHaveBeenCalled();

        });


        test("should rollback the transaction if a database query fails", async () => {

            const error = new Error("Database insertion failed");

            // first query call, return [] and the second call throw an error
            connection.query
                .mockResolvedValueOnce([])
                .mockRejectedValueOnce(error);

            
            await expect(addTrivia(trivia))
                .rejects
                .toThrow("Database insertion failed");

            // Transaction should have started
            expect(connection.beginTransaction).toHaveBeenCalled();

            // Verify the Trivia INSERT succeeded
            expect(connection.query).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining("INSERT INTO Trivia"),
                [
                    trivia.triviaID,
                    trivia.triviaTitle,
                    trivia.AdminName,
                    trivia.Email,
                    trivia.AdminToken,
                    trivia.RoomCode
                ]
            );

            // Verify the Question INSERT was attempted and failed
            expect(connection.query).toHaveBeenNthCalledWith(
                2,
                expect.stringContaining("INSERT INTO Question"),
                [
                    trivia.questions[0].questionID,
                    trivia.triviaID,
                    trivia.questions[0].text
                ]
            );

            // No further queries should execute
            expect(connection.query).toHaveBeenCalledTimes(2);

            // Transaction should rollback
            expect(connection.rollback).toHaveBeenCalled();

            // Transaction should NOT commit
            expect(connection.commit).not.toHaveBeenCalled();

            // Connection should still be released
            expect(connection.release).toHaveBeenCalled();
        });

    });


    describe("addAttempt()", () => {

        const attempt = {
            ID: "DEF123", 
            TriviaID: "ABC123", 
            AttemptName: "Leon", 
            DateStarted: "2026-11-04 00:34:26", 
            FinishDateTime: "2026-11-04 00:45:26",
            answers: ["ABC123"]
        }

        test("should successfully submit a trivia attempt and commit a transaction", async () => {
            await addAttempt(attempt);

            expect(db.getConnection).toHaveBeenCalledTimes(1);

            expect(connection.beginTransaction).toHaveBeenCalledTimes(1)
            
            expect(connection.query).toHaveBeenCalledWith(
                expect.stringContaining("INSERT INTO Trivia_Attempt"),
                [
                    attempt.ID,
                    attempt.TriviaID,
                    attempt.AttemptName,
                    attempt.DateStarted,
                    attempt.FinishDateTime
                ]
            );

            expect(connection.query).toHaveBeenCalledWith(
                expect.stringContaining("INSERT INTO Selected_Option"),
                [
                    attempt.ID,
                    attempt.answers[0]
                ]
            );

            expect(connection.commit).toHaveBeenCalledTimes(1);
            
            expect(connection.release).toHaveBeenCalledTimes(1);
        });

        test("should rollback the transaction if an error occurs", async () => {

    
            

            connection.query.mockRejectedValueOnce(new Error("Database error"));

            await expect(addAttempt(attempt))
                .rejects
                .toThrow("Database error");

            expect(db.getConnection).toHaveBeenCalledTimes(1);

            expect(connection.beginTransaction).toHaveBeenCalledTimes(1);

            expect(connection.rollback).toHaveBeenCalledTimes(1);

            expect(connection.commit).not.toHaveBeenCalled();
            expect(connection.release).toHaveBeenCalledTimes(1);
        });

    });


    describe("getTriviaByRoomCode()", () => {
        let roomCode = 'ABC123';
        let retrievedTrivia = [
            {
                ID: 'ABC123',
                TriviaTitle: 'Computer Science Trivia',
                AdminName: 'Leon',
                Email: "leon@mail.com",
                AdminToken: 'DEFGHIJ',
                RoomCode: 'DEFHIJ',
                DateCreated: '2026/11/20 10:00:12',
                DateStarted: '2026/11/20 10:00:12',
                DateClosed: null,
                Status: 'Open'
            }
        ];
        test("should successfully retrieve a trivia by room code", async () => {
            
            db.query.mockResolvedValueOnce([retrievedTrivia]);

            const result = await getTriviaByRoomCode(roomCode);

            expect(db.query).toHaveBeenCalledTimes(1);

            expect(db.query).toHaveBeenNthCalledWith(
                1, 
                expect.stringContaining('SELECT * FROM Trivia WHERE RoomCode = ?'),
                [ roomCode ]
            );

            expect(result).toEqual(retrievedTrivia);
            expect(result).not.toEqual([]);

        });

        test("should return an empty array when no trivia is found", async () => {
            db.query.mockResolvedValue([[]]);
            const result = await getTriviaByRoomCode(roomCode);

            expect(db.query).toHaveBeenCalledTimes(1);
            expect(result).toEqual([]);
        });       

        test("should throw an error upon database failure", async () => {

            db.query.mockRejectedValueOnce(new Error("Database error"));

            await expect(getTriviaByRoomCode(roomCode))
                .rejects
                .toThrow("Database error");

            expect(db.query).toHaveBeenCalledTimes(1);

        });


        afterEach(() => {
            jest.clearAllMocks();
        })
    });


    describe("getTriviaByAdminToken()", () => {
        const adminToken = "abcdefghijknlmn1234567890";

        const retrievedTrivia = [
            {
                ID: 'ABC123',
                TriviaTitle: 'Computer Science Trivia',
                AdminName: 'Leon',
                Email: "leon@mail.com",
                AdminToken: adminToken,
                RoomCode: 'DEFHIJ',
                DateCreated: '2026/11/20 10:00:12',
                DateStarted: '2026/11/20 10:00:12',
                DateClosed: null,
                Status: 'Open'
            }
        ];

        test("should retrieve a trivia using the admin token", async () => {
            db.query.mockResolvedValueOnce([retrievedTrivia]);

            const result = await getTriviaByAdminToken(adminToken);

            expect(db.query).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining('SELECT * FROM Trivia WHERE AdminToken = ?'), 
                [adminToken]
            );

            expect(db.query).toHaveBeenCalledTimes(1);

            expect(result).toEqual(retrievedTrivia);
        });

        test("should return an empty array when no trivia is found", async () => {
            db.query.mockResolvedValueOnce([[]]);
            const result = await getTriviaByAdminToken('aaa');

            expect(db.query).toHaveBeenCalledTimes(1);

            expect(result).toEqual([]);
        });

        test("should throw an error when the database query fails", async () => {
            db.query.mockRejectedValueOnce(new Error("Database error"));

            await expect(getTriviaByAdminToken(adminToken))
                .rejects
                .toThrow("Database error");

            expect(db.query).toHaveBeenCalledTimes(1);
        });

        afterEach(() => {
            jest.clearAllMocks();
        })
    });

    describe("getTriviaAvailableByRoomCode()", () => {
        const adminToken = "abcdefghijknlmn1234567890";
        const roomCode = 'DEFGHIJ';

        const retrievedTrivia = [
            {
                ID: 'ABC123',
                TriviaTitle: 'Computer Science Trivia',
                AdminName: 'Leon',
                Email: "leon@mail.com",
                AdminToken: adminToken,
                RoomCode: roomCode,
                DateCreated: '2026/11/20 10:00:12',
                DateStarted: '2026/11/20 10:00:12',
                DateClosed: null,
                Status: 'Open'
            }
        ];


        test("should successfully retrieve an open trivia", async () => {

            db.query.mockResolvedValue([retrievedTrivia]);

            const result = await getTriviaAvailableByRoomCode(roomCode);

            expect(db.query).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining('SELECT * FROM Trivia WHERE RoomCode = ? AND Status ="Open"'),
                [roomCode]
            );

            expect(db.query).toHaveBeenCalledTimes(1);
            
            expect(result).toEqual(retrievedTrivia);
            
        });


        test("should throw an error upon database failure", async () => {

            db.query.mockRejectedValueOnce(new Error("Database error"));

            await expect(getTriviaByAdminToken(adminToken))
                .rejects
                .toThrow("Database error");

            expect(db.query).toHaveBeenCalledTimes(1);

        });

        test("should return an empty array if no trivia is found", async () => {

            db.query.mockResolvedValue([[]]);

            const result = await getTriviaAvailableByRoomCode('');

            expect(db.query).toHaveBeenNthCalledWith(1,
                expect.stringContaining('SELECT * FROM Trivia WHERE RoomCode = ? AND Status ="Open"'), ['']
            );

            expect(db.query).toHaveBeenCalledTimes(1);

            expect(result).toEqual([]);

        });

        afterEach(() => {
            jest.clearAllMocks();
        });
    });


    describe("getTriviaDetailsForManagement()", () => {

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
`;
        const adminToken = "ABCDEFGHIJKLMNOPQRSTUV123";
       
        const triviaDetails = {
            triviaID: trivia.triviaID,
            TriviaTitle: trivia.triviaTitle,
            Status: 'Open',
            AdminName: trivia.AdminName,
            RoomCode: trivia.RoomCode,
            questions: 1,
            participants: 10    
        }


        test("should retrieve trivia details successfully based on the admin token", async () => {

            db.query.mockResolvedValueOnce([triviaDetails]);

            const result = await getTriviaDetailsForManagement(adminToken);



            expect(db.query).toHaveBeenNthCalledWith(
                1, 
                expect.stringContaining(SQL),
                 [adminToken]
            );

            expect(db.query).toHaveBeenCalledTimes(1);


            expect(result).toEqual(triviaDetails);
            
        });

        test("should throw an exception upon database failure", async () => {

            db.query.mockRejectedValueOnce(new Error("Database error"));

            await expect(getTriviaDetailsForManagement(adminToken)).rejects.toThrow("Database error");

            expect(db.query).toHaveBeenCalledTimes(1);
        });


        test("should return an empty array if the trivia is unavailable", async () => {

            db.query.mockResolvedValueOnce([[]]);

            const result = await getTriviaDetailsForManagement(adminToken);

            expect(db.query).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining(SQL),
                [adminToken]
            );

            expect(db.query).toHaveBeenCalledTimes(1);
            expect(result).toEqual([]);

        });


        afterEach(() => {
            jest.clearAllMocks();
        })
    }); 


    describe("getLeaderboard()", () => {
        const adminToken = "asdjkfa;dskjf";
        const leaderboard = [
            {
                attempt_time_minutes:2,
                AttemptName:"Bob",
                correct_answers:1,

            },{
                attempt_time_minutes:1,
                AttemptName:"Leo",
                correct_answers:1,
                
            },{
                attempt_time_minutes:3,
                AttemptName:"Tom",
                correct_answers:0,
                
            },{
                attempt_time_minutes:2,
                AttemptName:"Sam",
                correct_answers:1,
                
            }
        ];

  const SQL = `
    SELECT
      TIMESTAMPDIFF(
          MICROSECOND,
          ta.DateStarted,
          ta.DateSubmitted
      ) AS attempt_time_minutes,
      ta.AttemptName,
      SUM(question_results.is_correct) AS correct_answers

    FROM Trivia_Attempt ta

    INNER JOIN Trivia t
        ON t.ID = ta.TriviaID

    INNER JOIN (
        SELECT
            so.AttemptID,
            qo.QuestionID,

            CASE
                WHEN SUM(qo.IsCorrect) = COUNT(*)
                THEN 1
                ELSE 0
            END AS is_correct

        FROM Selected_Option so

        INNER JOIN Question_Option qo
            ON qo.ID = so.OptionID

        GROUP BY
            so.AttemptID,
            qo.QuestionID
    ) AS question_results
        ON question_results.AttemptID = ta.ID

    WHERE t.AdminToken = ?

    GROUP BY
        ta.ID,
        ta.AttemptName,
        ta.DateStarted,
        ta.DateSubmitted

    ORDER BY
        correct_answers DESC,
        attempt_time_minutes ASC;
  `;

        test("should retrieve a leaderboard based on the admin token", async () => {
            db.query.mockResolvedValueOnce([leaderboard]);

            const result = await getLeaderboard(adminToken);

            expect(db.query).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining(SQL),
                [adminToken]
            );

            expect(db.query).toHaveBeenCalledTimes(1);

            expect(result).toEqual(leaderboard);
        });

        test("should throw an exception upon database error", async () => {
            db.query.mockRejectedValueOnce(new Error("Database error"));

            await expect(getLeaderboard(adminToken)).rejects.toThrow("Database error");

            expect(db.query).toHaveBeenCalledTimes(1);

            
        });

        test("should retrieve an empty array if no trivia is found", async () => {
            db.query.mockResolvedValueOnce([[]]);

            const result = await getLeaderboard(adminToken);

            expect(result).toEqual([]);
            expect(db.query).toHaveBeenCalledTimes(1);
        });

        afterEach(() => {
            jest.clearAllMocks();
        });
    });

    describe("stopTrivia()", () => {
        const adminToken = "asd;kfja;dsf";

        // mock the database response
        const resolved = [
            {
                affectedRows: 0,
                changedRows: 0
            },
            undefined
        ];
        

        test("should stop a known trivia", async () => {
            resolved[0].affectedRows = 1;
            resolved[0].changedRows = 1;
            db.query.mockResolvedValue(resolved);
            await stopTrivia(adminToken);

            expect(db.query).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining('UPDATE Trivia SET Status = "Closed", DateClosed = NOW() WHERE AdminToken = ?'),
                [adminToken]
            );

            expect(db.query).toHaveBeenCalledTimes(1);
        });

        test("should not modify any entries if admin token does not belong to a trivia", async () => {
            resolved[0].affectedRows = 0;
            resolved[0].changedRows = 0;
            db.query.mockResolvedValue(resolved);
            await stopTrivia(adminToken);

            expect(db.query).toHaveBeenNthCalledWith(
                1,
                expect.stringContaining('UPDATE Trivia SET Status = "Closed", DateClosed = NOW() WHERE AdminToken = ?'),
                [adminToken]
            );

            expect(db.query).toHaveBeenCalledTimes(1);

        });

        test("should throw an error if database query fails", async () => {
            db.query.mockRejectedValueOnce(new Error("Database error"));

            await expect(stopTrivia(adminToken))
                .rejects
                .toThrow("Database error");

            expect(db.query).toHaveBeenCalledTimes(1);
        });
    });
});