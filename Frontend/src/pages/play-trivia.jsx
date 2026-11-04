import "../assets/styles/play-trivia.css";

import { useEffect, useState } from "react"
import { getTrivia } from "../services/trivia.service";
import { useNavigate, useParams } from "react-router-dom";
import { submitAttempt } from "../services/trivia.service";

export default function PlayTrivia() {
  const [trivia, setTrivia] = useState({});
  const [questions, setQuestions] = useState([
  ]);

  const navigate = useNavigate();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [answers, setAnswers] = useState([]);

  const [numSelected, setNumSelected] = useState(0);

  const [entryNameTemp, setEntryNameTemp] = useState(undefined);
  const [entryName, setEntryName] = useState(undefined);
  const [startDate, setStartDate] = useState(undefined);
  const {roomCode} = useParams();


  // load the questions from the backend
  useEffect(() => {
   
    async function load() {
      
      const qs = await getTrivia(roomCode);
      if(qs.ok) {
        
        const data = await qs.json();
        
        setQuestions(data.questions);
        setTrivia(data);
        //setAnswers(data.questions.map(question => ({ID: question.ID, options: []})));
        const now = new Date();

        setStartDate( now.toISOString().slice(0, 23).replace('T', ' '));
      } else {
        if(qs.status === 404)
          alert('Cannot play trivia, trivia is closed');
        navigate("/")
      }
    }

    load();
  }, [entryName]);

  function handleCheckOption(qIndex, oIndex) {
    const updated= [...questions];
    const question = updated[qIndex];
    if(!question.multipleAnswers) {
      question.options = question.options.map(option => ({ID: option.ID, text:option.text, selected:false}));
      question.options[oIndex].selected = true;
      updated[qIndex] = question;
      setNumSelected(1);
    } else {   
      if(updated[qIndex].options[oIndex].selected)
        setNumSelected(numSelected - 1);
      else
        setNumSelected(numSelected + 1);

      updated[qIndex].options[oIndex].selected = !updated[qIndex].options[oIndex].selected;

    }
    setQuestions(updated);
  }

  function goToNextQuestion() {
    let selected = 0;
    questions[currentQuestionIndex + 1].options.forEach(option => {
      if(option.selected)
        selected++;
    });
   // console.log(selected);
    setNumSelected(selected);
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  }

  function goToPrevQuestion() {
    let selected = 0;
    questions[currentQuestionIndex - 1].options.forEach(option => {
      if(option.selected)
        selected++;
    });
   // console.log(selected)
    setNumSelected(selected);
    setCurrentQuestionIndex(currentQuestionIndex - 1);
  }

  async function submitAttemptToAPI(startDateTime, TriviaID, AttemptName, DateStarted, solvedQuestions) {
    const now = new Date();
       
    const FinishDateTime =  now.toISOString().slice(0, 23).replace('T', ' ');

    const a = {
      AttemptName, 
      FinishDateTime, 
      questions: solvedQuestions,
      TriviaID,
      DateStarted
    }

   // console.log(a);
    const res = await submitAttempt(a);
    if(res.ok) {
      alert("Response submitted successfully");
      navigate('/');
    } else {
      const data = await res.json();
      alert(data.message);
    }
  }


if (!entryName) {
  return (
    <div className="entry-screen">
      <div className="entry-card">
        <div className="entry-icon">👤</div>

        <p className="entry-eyebrow">READY TO PLAY?</p>
        <h1>Join the game.</h1>
        <p className="entry-description">
          Choose a display name to enter the trivia.
        </p>

        <form
          className="entry-form"
          onSubmit={(e) => {
            e.preventDefault();
            const name = entryNameTemp.trim();

            if (!name) {
              alert("Please enter your display name");
              return;
            }

            setEntryName(name);
          }}
        >
          <label htmlFor="display-name">Display name</label>
          <input
            id="display-name"
            type="text"
            placeholder="Enter your name"
            value={entryNameTemp}
            onChange={(e) => setEntryNameTemp(e.target.value)}
            className="entry-name-screen"
            maxLength={20}
            autoComplete="off"
          />

          <button type="submit" className="start-button">
            Start playing <span>→</span>
          </button>
        </form>

        <p className="entry-footer">GOOD LUCK · HAVE FUN</p>
      </div>
    </div>
  );
}

if (!questions || questions.length === 0) return null;

const currentQuestion = questions[currentQuestionIndex];
const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

return (
  <div className="container">
    <div className="trivia-card">

      {/* Trivia header */}
      <div className="trivia-header">
        <div>
          <p className="trivia-eyebrow">NOW PLAYING</p>
          <h2>{trivia.TriviaTitle}</h2>
          <p className="trivia-host">Hosted by {trivia.AdminName}</p>
        </div>

        <div className="question-counter">
          {currentQuestionIndex + 1}
          <span> / {questions.length}</span>
        </div>
      </div>

      {/* Progress */}
      <div className="progress-container">
        <div
          className="progress-bar"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question */}
      <div className="question-section">
        <span className="question-label">
          QUESTION {currentQuestionIndex + 1}
        </span>

        <h1>{currentQuestion.QuestionText}</h1>

        <p className="answer-instruction">
          {currentQuestion.multipleAnswers
            ? "Select all the correct answers."
            : "Select one answer."}
        </p>
      </div>

      {/* Answer options */}
      <div className="questions-section">
        {currentQuestion.options.map((option, i) => (
          <label
            key={option.ID}
            className={`answer-option ${option.selected ? "selected" : ""}`}
          >
            <input
              type={currentQuestion.multipleAnswers ? "checkbox" : "radio"}
              name={`question-${currentQuestionIndex}`}
              checked={option.selected}
              onChange={() => handleCheckOption(currentQuestionIndex, i)}
            />

            <span className="option-indicator">
              {String.fromCharCode(65 + i)}
            </span>

            <span className="option-text">{option.text}</span>

            {option.selected && (
              <span className="option-check">✓</span>
            )}
          </label>
        ))}
      </div>

      {/* Navigation */}
      <div className="game-controls-section">

        <button
          onClick={goToPrevQuestion}
          className="prev-button"
          disabled={currentQuestionIndex === 0}
        >
          ← Previous
        </button>

        {currentQuestionIndex < questions.length - 1 ? (
          <button
            onClick={goToNextQuestion}
            className="next-button"
            disabled={numSelected === 0}
          >
            Next question →
          </button>
        ) : (
          <button
            onClick={async () =>
              await submitAttemptToAPI(
                startDate,
                trivia.ID,
                entryName,
                startDate,
                questions
              )
            }
            className="submit-button"
            disabled={numSelected === 0}
          >
            Submit answers ✓
          </button>
        )}

      </div>
    </div>
  </div>
);

}