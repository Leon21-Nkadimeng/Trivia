// Mock the database module
jest.mock("../src/config/database");

const db = require("../src/config/database");
const { addTrivia } = require("../src/services/trivia.service");

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
            expect(db.getConnection).toHaveBeenCalled();

            // Verify transaction started
            expect(connection.beginTransaction).toHaveBeenCalled();

            // Trivia + question + 2 options
            expect(connection.query).toHaveBeenCalledTimes(4);
            
// verify trivia insert
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


            // verify question insert
            expect(connection.query).toHaveBeenNthCalledWith(
                2,
                expect.stringContaining("INSERT INTO Question"),
                [
                    trivia.questions[0].questionID,
                    trivia.triviaID,
                    trivia.questions[0].text
                ]
            );

            // verify the first option
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
            // verify the second option
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

});