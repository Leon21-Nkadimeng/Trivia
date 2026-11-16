// mock the methods that the controller invokes
jest.mock("../src/utils/trivia.utils");
jest.mock("../src/services/trivia.service");
jest.mock("../src/services/gmail.service");

// import supertest
const request = require("supertest");
// imports the express application
const app = require("../src/app");

const utils = require("../src/utils/trivia.utils");
const triviaService = require("../src/services/trivia.service");
const { sendTriviaManagementLink } = require("../src/services/gmail.service");


/** API Tests */
describe("Trivia API", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        utils.generateRoomCode.mockResolvedValue("ABC123");

        triviaService.addTrivia.mockResolvedValue(undefined);

        sendTriviaManagementLink.mockResolvedValue(undefined);
    });
    

    describe("POST /trivias/create", () => {

        const triviaData = {
            AdminName: "Leon",
            triviaTitle: "Computer Science Trivia",
            Email: "test@example.com",
            questions: [
                {
                    text: "What is 2 + 2?",
                    options: [
                        {
                            text: "4",
                            isCorrect: true
                        },
                        {
                            text: "5",
                            isCorrect: false
                        }
                    ]
                }
            ]
        };

        test("should create a trivia", async () => {
            // specify which express app, http method, and endpoint to test and send triviaData to that endpoint.
            const response = await request(app)
                .post('/trivias/create')
                .send(triviaData);

            // verify http status
            expect(response.status).toBe(201);

            // verify response body
            expect(response.body).toEqual({
                message: "Trivia created successfully",
                RoomCode: "ABC123",
                AdminToken: expect.any(String) // we expect any string since we do not know the exact value of the string
            });
        });

    });

});

