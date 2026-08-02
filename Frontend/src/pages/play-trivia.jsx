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
       console.log(qs);
        const data = await qs.json();
        setQuestions(data.questions);
        setTrivia(data);
        //setAnswers(data.questions.map(question => ({ID: question.ID, options: []})));
        const now = new Date();

        setStartDate( now.toISOString().slice(0, 16).replace('T', ' '));
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
       
    const FinishDateTime =  now.toISOString().slice(0, 16).replace('T', ' ');

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

  if(!entryName) {
    return (
    <div className="entry-screen">
      <input type="text" placeholder="Display name" onChange={(e) => setEntryNameTemp(e.target.value)} className="entry-name-screen" />
      <button onClick={() => entryNameTemp ? setEntryName(entryNameTemp) : alert("Please enter your display name")} className="start-button">Start</button>
    </div>)
  }

  if(!questions || questions.length === 0) return null;

  return (
    <div className="container">
    <div className="trivia-card">
      <div className="title-section"><h2>{trivia.TriviaTitle} by {trivia.AdminName}</h2></div>
      <hr />
      <div className="question-section"><span>Question {currentQuestionIndex + 1} / {questions.length}</span></div>
      <div>{questions[currentQuestionIndex].QuestionText}</div>
      <div className="questions-section">
      {questions[currentQuestionIndex].options.map((option, i) => (
        <div key={option.ID}>
          {questions[currentQuestionIndex].multipleAnswers ?
          <input type="checkbox" checked={option.selected} onChange={() => handleCheckOption(currentQuestionIndex, i)} /> : <input type="radio" checked={option.selected} onChange={() => handleCheckOption(currentQuestionIndex, i)} />
          }
          <span>{option.text}</span>
        </div>
      ))
      }
      </div>
      <div className="game-controls-section">
        { currentQuestionIndex < questions.length - 1 && numSelected > 0 &&
        <button onClick={() => goToNextQuestion()} className="next-button">Next Question</button>
        }

        {
          currentQuestionIndex > 0 &&
          <button onClick={() => goToPrevQuestion()} className="prev-button">Previous Question</button>
        }
        {
          currentQuestionIndex === questions.length - 1 && numSelected > 0 &&
          <button onClick={async () => await submitAttemptToAPI(startDate, trivia.ID, entryName, startDate, questions)} className="submit-button">Submit</button>
        }
      </div>
    </div>
    </div>
  )
}