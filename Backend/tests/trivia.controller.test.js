const request = require("supertest");
const app = require("../src/app");

const triviaService = require("../src/services/trivia.service");
const utils = require("../src/utils/trivia.utils");

const { sendTriviaManagementLink } = require("../src/services/gmail.service");


jest.mock("../src/services/trivia.service");
jest.mock("../src/utils/trivia.utils");
jest.mock("../src/services/gmail.service", () => ({
  sendTriviaManagementLink: jest.fn()
}));

describe("POST /trivias/create", () => {
  // sample trivia data
  const triviaData = {
    AdminName: "Leon",
    triviaTitle: "Computer Science Trivia",
    Email: "leon@example.com",
    questions: [
        {
            text: "What is OOP?",
            options: [
                { text: "Object Oriented Programming", isCorrect: true },
                { text: "Operating Operating Protocol", isCorrect: false }
            ]
        }
    ]
  };


  test("should successfully create a trivia", async () => {
    const roomCode = "ABC123";
    utils.generateRoomCode.mockResolvedValueOnce(roomCode);

    triviaService.addTrivia.mockResolvedValueOnce(undefined);

    sendTriviaManagementLink.mockResolvedValueOnce(undefined);

    const response = await request(app)
      .post("/trivias/create")
      .send(triviaData);

    expect(triviaService.addTrivia).toHaveBeenCalledWith({
      triviaID: expect.any(String),
      triviaTitle: "Computer Science Trivia",
      AdminName: "Leon",
      Email: "leon@example.com",
      AdminToken: expect.any(String),
      RoomCode: roomCode,
      questions: [
        {
          questionID: expect.any(String),
          text: "What is OOP?",
          options: [
            {
              optionID: expect.any(String),
              text: "Object Oriented Programming", 
              isCorrect: 1
            },
            {
              optionID: expect.any(String),
              text: "Operating Operating Protocol", 
              isCorrect: 0
            }
          ]
        }
      ]
    });

    expect(sendTriviaManagementLink).toHaveBeenCalledWith({
        to: "leon@example.com",
        adminToken: expect.any(String)
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
        message: "Trivia created successfully",
        RoomCode: "ABC123",
        AdminToken: expect.any(String)
    });

    expect(triviaService.addTrivia).toHaveBeenCalledTimes(1);
    expect(sendTriviaManagementLink).toHaveBeenCalledTimes(1);
    

  });


  test("should return a status of 500 if there is a database error", async () => {
    triviaService.addTrivia.mockRejectedValueOnce(new Error("Database error")); 
    sendTriviaManagementLink.mockResolvedValueOnce(undefined);
    const roomCode = "ABC123";
    utils.generateRoomCode.mockResolvedValueOnce(roomCode);

    const response = await request(app)
      .post("/trivias/create")
      .send(triviaData);

    expect(triviaService.addTrivia).toHaveBeenCalledWith({
      triviaID: expect.any(String),
      triviaTitle: "Computer Science Trivia",
      AdminName: "Leon",
      Email: "leon@example.com",
      AdminToken: expect.any(String),
      RoomCode: roomCode,
      questions: [
        {
          questionID: expect.any(String),
          text: "What is OOP?",
          options: [
            {
              optionID: expect.any(String),
              text: "Object Oriented Programming", 
              isCorrect: 1
            },
            {
              optionID: expect.any(String),
              text: "Operating Operating Protocol", 
              isCorrect: 0
            }
          ]
        }
      ]
    });

    // expect an error status from the server
    expect(response.status).toBe(500);
    expect(response.body.message).toEqual("Database error");

    expect(triviaService.addTrivia).toHaveBeenCalledTimes(1);
    expect(sendTriviaManagementLink).not.toHaveBeenCalled();
    
  });


  // clear mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });
});

const roomCode = "ABC123";

describe(`GET /trivias/get/trivia/${roomCode}`, () => {
  // clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });
  const trivia = [
    {
      ID: ';aksldfjasdfas',
      TriviaTitle: 'Computer Science Trivia',
      AdminName: 'Leon',
      Email: "leon@mail.com",
      AdminToken: "abcdefghijklmnopq123",
      RoomCode: roomCode,
      DateCreated: '2026/11/20 10:00:12',
      DateStarted: '2026/11/20 10:00:12',
      DateClosed: null,
      Status: 'Open'
    }
  ];

  const emptyTrivia = [];



  const questions = [
    {
      questionID: "question-123",
      text: "What is OOP?",
      options: [
        {
            optionID: "option-1",
            text: "Object Oriented Programming",
            isCorrect: 1
        },
        {
            optionID: "option-2",
            text: "Old Object Programming",
            isCorrect: 0
        }
      ]
    }
  ];

  test("should successfully retrieve a trivia with one question and one answer", async () => {
    triviaService.getTriviaAvailableByRoomCode.mockResolvedValueOnce(trivia);

    // mock the questions
    triviaService.getTriviaQuestions.mockResolvedValueOnce([
      {
        ID: "question-123",
        QuestionText: "What is OOP?"
      }
    ]);
    // mock the question's options
    triviaService.getQuestionOptions.mockResolvedValueOnce([
      {
        ID: "option-1",
        OptionText: "Object Oriented Programming",
        IsCorrect: 1
      },
      {
        ID: "option-2",
        OptionText: "Old Object Programming",
        IsCorrect: 0
      }
    ]);


    const response = await request(app)
      .get(`/trivias/get/trivia/ABC123`);

    expect(triviaService.getTriviaAvailableByRoomCode).toHaveBeenCalledTimes(1);
    expect(triviaService.getTriviaQuestions).toHaveBeenCalledTimes(1);

    expect(triviaService.getTriviaAvailableByRoomCode).toHaveBeenCalledWith("ABC123");
    expect(triviaService.getTriviaQuestions).toHaveBeenCalledWith(";aksldfjasdfas");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      ID: ";aksldfjasdfas",
      TriviaTitle: "Computer Science Trivia",
      AdminName: "Leon",
      questions: [
        {
          ID: "question-123",
          QuestionText: "What is OOP?",
          multipleAnswers: false,
          options: [
            {
              ID: "option-1",
              text: "Object Oriented Programming",
              selected: false
            },
            {
              ID: "option-2",
              text: "Old Object Programming",
              selected: false
            }
          ]
        }
      ]
    });
  });


  test("should successfully retrieve a trivia with more than one question and more than one answer", async () => {
    triviaService.getTriviaAvailableByRoomCode.mockResolvedValueOnce(trivia);

    // mock the questions
    triviaService.getTriviaQuestions.mockResolvedValueOnce([
      {
        ID: "question-123",
        QuestionText: "What is OOP?"
      },
      {
        ID: "question-456",
        QuestionText: "Select all statically typed languages below."
      }
    ]);
    // mock the question's options
    triviaService.getQuestionOptions.mockResolvedValueOnce([
      {
        ID: "option-1",
        OptionText: "Object Oriented Programming",
        IsCorrect: 1
      },
      {
        ID: "option-2",
        OptionText: "Old Object Programming",
        IsCorrect: 0
      }
    ])
    .mockResolvedValueOnce([
      {
        ID: "option-2",
        OptionText: "C++",
        IsCorrect: 1
      },
      {
        ID: "option-3",
        OptionText: "Python",
        IsCorrect: 0
      },
      {
        ID: "option-4",
        OptionText: "Java",
        IsCorrect: 1
      },
      {
        ID: "option-5",
        OptionText: "JavaScript",
        IsCorrect: 0
      }
    ]);


    const response = await request(app)
      .get(`/trivias/get/trivia/ABC123`);

    expect(triviaService.getTriviaAvailableByRoomCode).toHaveBeenCalledTimes(1);


    expect(triviaService.getTriviaQuestions).toHaveBeenCalledTimes(1);

    expect(triviaService.getQuestionOptions).toHaveBeenCalledTimes(2);

    expect(triviaService.getTriviaAvailableByRoomCode).toHaveBeenCalledWith("ABC123");
    expect(triviaService.getTriviaQuestions).toHaveBeenCalledWith(";aksldfjasdfas");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      ID: ";aksldfjasdfas",
      TriviaTitle: "Computer Science Trivia",
      AdminName: "Leon",
      questions: [
        {
          ID: "question-123",
          QuestionText: "What is OOP?",
          multipleAnswers: false,
          options: [
            {
              ID: "option-1",
              text: "Object Oriented Programming",
              selected: false
            },
            {
              ID: "option-2",
              text: "Old Object Programming",
              selected: false
            }
          ]
        },
        {
          ID: "question-456",
          QuestionText: "Select all statically typed languages below.",
          multipleAnswers: true,
          options: [
            {
              ID: "option-2",
              text: "C++",
              selected: false
            },
            {
              ID: "option-3",
              text: "Python",
              selected: false
            },
            {
              ID: "option-4",
              text: "Java",
              selected: false
            },
            {
              ID: "option-5",
              text: "JavaScript",
              selected: false
            }
          ]
        }
      ]
    });
  });

  test("should successfully retrieve a trivia with more than one question and more than one answer", async () => {
    triviaService.getTriviaAvailableByRoomCode.mockResolvedValueOnce(trivia);

    // mock the questions
    triviaService.getTriviaQuestions.mockResolvedValueOnce([
      {
        ID: "question-123",
        QuestionText: "What is OOP?"
      },
      {
        ID: "question-456",
        QuestionText: "Select all statically typed languages below."
      }
    ]);
    // mock the question's options
    triviaService.getQuestionOptions.mockResolvedValueOnce([
      {
        ID: "option-1",
        OptionText: "Object Oriented Programming",
        IsCorrect: 1
      },
      {
        ID: "option-2",
        OptionText: "Old Object Programming",
        IsCorrect: 0
      }
    ])
    .mockResolvedValueOnce([
      {
        ID: "option-2",
        OptionText: "C++",
        IsCorrect: 1
      },
      {
        ID: "option-3",
        OptionText: "Python",
        IsCorrect: 0
      },
      {
        ID: "option-4",
        OptionText: "Java",
        IsCorrect: 1
      },
      {
        ID: "option-5",
        OptionText: "JavaScript",
        IsCorrect: 0
      }
    ]);


    const response = await request(app)
      .get(`/trivias/get/trivia/ABC123`);

    expect(triviaService.getTriviaAvailableByRoomCode).toHaveBeenCalledTimes(1);


    expect(triviaService.getTriviaQuestions).toHaveBeenCalledTimes(1);

    expect(triviaService.getQuestionOptions).toHaveBeenCalledTimes(2);

    expect(triviaService.getTriviaAvailableByRoomCode).toHaveBeenCalledWith("ABC123");
    expect(triviaService.getTriviaQuestions).toHaveBeenCalledWith(";aksldfjasdfas");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      ID: ";aksldfjasdfas",
      TriviaTitle: "Computer Science Trivia",
      AdminName: "Leon",
      questions: [
        {
          ID: "question-123",
          QuestionText: "What is OOP?",
          multipleAnswers: false,
          options: [
            {
              ID: "option-1",
              text: "Object Oriented Programming",
              selected: false
            },
            {
              ID: "option-2",
              text: "Old Object Programming",
              selected: false
            }
          ]
        },
        {
          ID: "question-456",
          QuestionText: "Select all statically typed languages below.",
          multipleAnswers: true,
          options: [
            {
              ID: "option-2",
              text: "C++",
              selected: false
            },
            {
              ID: "option-3",
              text: "Python",
              selected: false
            },
            {
              ID: "option-4",
              text: "Java",
              selected: false
            },
            {
              ID: "option-5",
              text: "JavaScript",
              selected: false
            }
          ]
        }
      ]
    });
  });


});