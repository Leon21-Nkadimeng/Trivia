import { useState } from "react";
import '../assets/styles/create-trivia.css'

import { submitTrivia } from "../services/trivia.service";
import { useNavigate } from "react-router-dom";
export default function CreateTrivia() {
  const navigation = useNavigate();
  const [adminName, setAdminName] = useState('');
  const [hostEmail, setHostEmail] = useState('');
  const [triviaTitle, setTriviaTitle] = useState('');
  const [questions, setQuestions] = useState([{
    text: '', 
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
      text: '', 
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
    updated[index].text = text;
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

  async function submitTriviaToAPI() {
    if(!adminName){
      alert('Admin name is required');
      return;
    }

    if(!hostEmail){
      alert('Host email is required');
      return;
    }

    if(!triviaTitle){
      alert('Trivia title is required');
      return;
    }

    if(!questions || questions.length === 0) {
      alert('You need at least one question')
      return;
    }

    if(!questions[0].options || questions[0].options.length < 2) {
      alert('You need at least two options');
      return;
    }

    const trivia = {
      AdminName: adminName,
      triviaTitle: triviaTitle,
      Email: hostEmail,
      questions: questions
    }
    

    try {
      const data = await submitTrivia(trivia);
      if(!data.AdminToken)
        alert(data.message);
      else
        navigation(`/manage/${data.AdminToken}`);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className='create-trivia-form'>
      <h2>Create a trivia</h2>
      <p className='form-subtitle'>Add your details and at least one question</p>

      <label>Your Name</label>
      <input 
        type="text"
        placeholder="e.g., Leon"
        value={adminName}
        onChange={(e) => setAdminName(e.target.value)}
      />

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
            value={q.text}
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
                placeholder={`Option ${opt.text ? opt.text : i + 1}`}
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

      <button type='button' className='submit-btn' onClick={submitTriviaToAPI}>
        Create trivia
      </button>
    </div>
  );
}