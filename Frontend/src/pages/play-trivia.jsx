import { useState } from "react"

export default function PlayTrivia() {
  const [questions, setQuestions] = useState([
    {
    text:"What is 1 + 1?",
    multipleAnswers: false,
    options:[
      { text:'3', selected:false},
      {text:'5', selected:false},
      {text:'5', selected:false}
    ]},
    {
    text:"What is 2 + 2?",
    multipleAnswers: true,
    options:[
      { text:'3', selected:false},
      {text:'5', selected:false},
      {text:'5', selected:false}
    ]},
    {
    text:"What is 2 + 2?",
    multipleAnswers: false,
    options:[
      { text:'3', selected:false},
      {text:'5', selected:false},
      {text:'5', selected:false}
    ]}
  ]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // todo: get questions from the backend

  function handleCheckOption(qIndex, oIndex) {
    const updated= [...questions];
    const question = updated[qIndex];
    if(!question.multipleAnswers) {
      question.options = question.options.map(option => ({text:option.text, selected:false}));
      question.options[oIndex].selected = true;
      updated[qIndex] = question;
    } else {    
      updated[qIndex].options[oIndex].selected = !updated[qIndex].options[oIndex].selected;
    }
    setQuestions(updated);
  }
  return (
    <div>
      <div>Question {currentQuestionIndex + 1} / {questions.length}</div>
      <div>{questions[currentQuestionIndex].text}</div>
      {questions[currentQuestionIndex].options.map((option, i) => (
        <div key={i}>
          {questions[currentQuestionIndex].multipleAnswers ?
          <input type="checkbox" checked={option.selected} onChange={() => handleCheckOption(currentQuestionIndex, i)} /> : <input type="radio" checked={option.selected} onChange={() => handleCheckOption(currentQuestionIndex, i)} />
          }
          <span>{option.text}</span>
        </div>
      ))
      }
      <div>
        { currentQuestionIndex < questions.length - 1 &&
        <button onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}>Next Question</button>
        }

        {
          currentQuestionIndex > 0 &&
          <button onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}>Previous Question</button>
        }
      </div>
    </div>
    
  )
}