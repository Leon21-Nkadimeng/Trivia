import { useEffect, useState } from "react"
import { getTrivia } from "../services/trivia.service";
import { useParams } from "react-router-dom";

export default function PlayTrivia() {
  const [trivia, setTrivia] = useState({});
  const [questions, setQuestions] = useState([
  ]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [answers, setAnswers] = useState([]);

  const [numSelected, setNumSelected] = useState(0);

  const [entryNameTemp, setEntryNameTemp] = useState(undefined);
  const [entryName, setEntryName] = useState(undefined);
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
    console.log(selected);
    setNumSelected(selected);
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  }

  function goToPrevQuestion() {
    let selected = 0;
    questions[currentQuestionIndex - 1].options.forEach(option => {
      if(option.selected)
        selected++;
    });
    console.log(selected)
    setNumSelected(selected);
    setCurrentQuestionIndex(currentQuestionIndex - 1);
  }

  if(!entryName) {
    return (
    <div>
      <input type="text" placeholder="Display name" onChange={(e) => setEntryNameTemp(e.target.value)} />
      <button onClick={() => entryNameTemp ? setEntryName(entryNameTemp) : alert("Please enter your display name")}>Start</button>
    </div>)
  }

  if(!questions || questions.length === 0) return null;

  return (
    <div>
      <div>{trivia.TriviaTitle} by {trivia.AdminName}</div>
      <div>Question {currentQuestionIndex + 1} / {questions.length}</div>
      <div>{questions[currentQuestionIndex].QuestionText}</div>
      {questions[currentQuestionIndex].options.map((option, i) => (
        <div key={option.ID}>
          {questions[currentQuestionIndex].multipleAnswers ?
          <input type="checkbox" checked={option.selected} onChange={() => handleCheckOption(currentQuestionIndex, i)} /> : <input type="radio" checked={option.selected} onChange={() => handleCheckOption(currentQuestionIndex, i)} />
          }
          <span>{option.text}</span>
        </div>
      ))
      }
      <div>
        { currentQuestionIndex < questions.length - 1 && numSelected > 0 &&
        <button onClick={() => goToNextQuestion()}>Next Question</button>
        }

        {
          currentQuestionIndex > 0 &&
          <button onClick={() => goToPrevQuestion()}>Previous Question</button>
        }
        {
          currentQuestionIndex === questions.length - 1 && numSelected > 0 &&
          <button onClick={() => {}}>Submit</button>
        }
      </div>
    </div>
    
  )
}