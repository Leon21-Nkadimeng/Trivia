// Mock the database module
jest.mock("../src/config/database");

const db = require("../src/config/database");
const { getTrivia } = require("../src/controllers/trivia.controller");
const { addTrivia, addAttempt, getTriviaByRoomCode, getTriviaByAdminToken } = require("../src/services/trivia.service");

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
    });

    describe("getTriviaAvailableByRoomCode()", async () => {
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


        test("should successfully retrieve an open trivia", async () => {
            
        });


        test("should throw an error upon failure", async () => {

        });

        test("should return an empty array if no trivia is found", async () => {

        });
    });
});