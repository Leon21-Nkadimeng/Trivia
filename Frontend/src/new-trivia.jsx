import { useState } from "react";
import './assets/styles/create-trivia.css'
export default function CreateTrivia() {
  const [hostEmail, setHostEmail] = useState('');
  const [triviaTitle, setTriviaTitle] = useState('');
  const [questions, setQuestions] = useState([{
    questionText: '', 
    options: [{
        text: '',
        isCorrect: false
      },
      {
        text: '',
        isCorrect: false
      }]
  }]);
  function output(obj) {
    console.log(obj);
  }


  function addQuestion() {
    
    const newQuestion = {
      questionText: '', 
      options: [{
        text: '',
        isCorrect: false
      },
      {
        text: '',
        isCorrect: false
      }]
    }

    setQuestions([...questions, newQuestion]);
  }

  function removeQuestion(index) {
    setQuestions(questions.filter((_, i) => i !== index));
  }

  function updateQuestionText(index, text) {
    const updated = [...questions];
    updated[index].questionText = text;
    setQuestions(updated);
  }

  function updateOptions(qIndex, oIndex, text) {
    const updated = [...questions];
    updated[qIndex].options[oIndex].text = text;
    output(updated);
    setQuestions(updated);
  }

  function setCorrectOption(qIndex, oIndex) {
    const updated = [...questions];
    updated[qIndex].options[oIndex].isCorrect = !updated[qIndex].options[oIndex].isCorrect;
    output(updated);
    setQuestions(updated);
  }

  function addQuestionOption(qIndex) {
    const updated = [...questions];
    updated[qIndex].options.push({
        text: '',
        isCorrect: false
      });
    output(updated);
      setQuestions(updated);
  }

  function removeOption(qIndex, oIndex) {
    const updated = [...questions];
    updated[qIndex].options = updated[qIndex].options.filter((_, i) => i !== oIndex);
    setQuestions(updated);
  }

  return (
    <div className='create-trivia-form'>
      <h2>Create a trivia</h2>
      <p className='form-subtitle'>Add your details and at least one question</p>

      <label>Your Email</label>
      <input 
        type="email"
        placeholder="name@example.com"
        value={hostEmail}
        onChange={(e) => setHostEmail(e.target.value)}
      />

      <label>Trivia title</label>
      <input 
        type="text"
        placeholder="e.g. Friday office Trivia"
        value={triviaTitle}
        onChange={(e) => setTriviaTitle(e.target.value)}
      />

      {questions.map((q, index) => 
        (<div className='question-card' key={index}>
          <div className='question-card-header'>
            <span>Question {index + 1}</span>
            {questions.length > 1 && (
              <button type="button" onClick={() =>  removeQuestion(index)}>Remove</button>
            )}
          </div>  

          <input
            type='text'
            placeholder='Question text'
            value={q.questionText}
            onChange={(e) => updateQuestionText(index, e.target.value)}
          />

          {q.options.map((opt, i) => (
            <div className='option-row' key={`${i}`}>
              <input 
                type="checkbox"
                name={`correct-${index}`}
                checked={opt.isCorrect}
                onChange={() => setCorrectOption(index, i)}
              />
              <input 
                type="text"
                placeholder={`Option ${opt.text ? opt.text : i}`}
                value={opt.text}
                onChange={(e) => updateOptions(index, i, e.target.value)}
              />
              {q.options.length > 2 &&
              (<button type="button" onClick={() => removeOption(index, i)}>Remove</button>)}
            </div>
          ))}
          <button type="button" onClick={() => addQuestionOption(index)}>Add Question Option</button>
        </div>
      ))}

      <button type='button' className='add-question-btn' onClick={() => addQuestion()}>
        + Add another question
      </button>

      <button type='button' className='submit-btn'>
        Create trivia
      </button>
    </div>
  );
}