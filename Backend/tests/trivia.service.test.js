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

            // Verify transaction committed
            expect(connection.commit).toHaveBeenCalled();

            // No rollback should occur
            expect(connection.rollback).not.toHaveBeenCalled();

            // Verify connection released
            expect(connection.release).toHaveBeenCalled();

        });


        test("should rollback the transaction if a database query fails", async () => {

            const error = new Error("Database insertion failed");

            // First query succeeds, second query fails
            connection.query
                .mockResolvedValueOnce([])
                .mockRejectedValueOnce(error);

            await expect(addTrivia(trivia))
                .rejects
                .toThrow("Database insertion failed");

            // Transaction should have started
            expect(connection.beginTransaction).toHaveBeenCalled();

            // Transaction should rollback
            expect(connection.rollback).toHaveBeenCalled();

            // Transaction should NOT commit
            expect(connection.commit).not.toHaveBeenCalled();

            // Connection should still be released
            expect(connection.release).toHaveBeenCalled();

        });

    });

});