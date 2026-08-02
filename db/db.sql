CREATE DATABASE IF NOT EXISTS Trivia_DB;
USE Trivia_DB;

-- show tables
/*
create table Hosts (
	ID VARCHAR(100) NOT NULL UNIQUE,
    Username VARCHAR(100) NOT NULL UNIQUE,
    Email VARCHAR(100) NOT NULL UNIQUE,
	Password VARCHAR(200) NOT NULL,
    DateCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    AccountStatus ENUM('Active', 'Inactive') DEFAULT 'Active'
);
*/
-- drop table Question_Option, Question, Trivia
CREATE TABLE Trivia (
	ID 	VARCHAR(200) NOT NULL UNIQUE,
    TriviaTitle VARCHAR(200) NOT NULL,
    AdminName VARCHAR(200) NOT NULL,
    Email VARCHAR(200) NOT NULL,
	AdminToken VARCHAR(100) NOT NULL,
    RoomCode VARCHAR(100) NOT NULL UNIQUE,
    DateCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DateStarted TIMESTAMP NULL,
    DateClosed DATETIME NULL,
    Status ENUM('Open', 'Closed') NOT NULL DEFAULT 'Closed',
    
    PRIMARY KEY(ID)
);

CREATE TABLE Question (
	ID VARCHAR(200) NOT NULL UNIQUE, 
    TriviaID VARCHAR(200) NOT NULL,
    QuestionText VARCHAR(200) NOT NULL,
    
    FOREIGN KEY(TriviaID) REFERENCES Trivia(ID),
    PRIMARY KEY(ID)
);

CREATE TABLE Question_Option (
	ID VARCHAR(200) NOT NULL UNIQUE,
    QuestionID VARCHAR(200) NOT NULL,
    OptionText VARCHAR(200) NOT NULL,
    IsCorrect BOOLEAN NOT NULL,
    
    FOREIGN KEY(QuestionID) REFERENCES Question(ID),
    PRIMARY KEY(ID)
);

CREATE TABLE Trivia_Attempt (
    ID VARCHAR(200) NOT NULL UNIQUE,
    TriviaID VARCHAR(200) NOT NULL,
    AttemptName VARCHAR(100) NOT NULL,
    DateStarted DATETIME NOT NULL,
    DateSubmitted DATETIME NOT NULL,

    FOREIGN KEY(TriviaID) REFERENCES Trivia(ID),
    PRIMARY KEY(ID)
);

CREATE TABLE Selected_Option (
    AttemptID VARCHAR(200) NOT NULL,
    OptionID VARCHAR(200) NOT NULL,
    FOREIGN KEY(AttemptID) REFERENCES Trivia_Attempt(ID),
    FOREIGN KEY(OptionID) REFERENCES Question_Option(ID),
    PRIMARY KEY(AttemptID, OptionID)
);








