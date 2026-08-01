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
-- drop table Trivia, Question, Question_Option
CREATE TABLE Trivia (
	ID 	VARCHAR(200) NOT NULL UNIQUE,
    Email VARCHAR(200) NOT NULL,
	AdminToken VARCHAR(100) NOT NULL,
    RoomCode VARCHAR(100) NOT NULL UNIQUE,
    DateCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DateClosed DATETIME NOT NULL,
    Status ENUM('Open', 'Closed'),
    
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





