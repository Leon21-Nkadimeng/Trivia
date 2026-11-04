import { useState } from "react";
import '../assets/styles/create-trivia.css'

import { submitTrivia } from "../services/trivia.service";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Trash2,
  CirclePlus,
  CheckCircle2,
  FileQuestion,
  Lightbulb,
  ClipboardList
} from 'lucide-react';
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
  <div className="create-page">
    <div className="create-container">

      {/* Page heading */}
      <header className="create-header">
        <div className="create-heading-icon">
          <ClipboardList size={25} />
        </div>

        <div>
          <h1>Create a trivia</h1>
          <p>Build your quiz, add questions, and challenge your friends.</p>
        </div>
      </header>

      {/* Trivia details */}
      <section className="form-section">
        <div className="section-heading">
          <div className="section-icon">
            <FileQuestion size={19} />
          </div>
          <div>
            <h2>Trivia details</h2>
            <p>Tell participants a little about your trivia.</p>
          </div>
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="adminName">Your name</label>
            <input
              id="adminName"
              type="text"
              placeholder="e.g. Leon"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="hostEmail">Your email</label>
            <input
              id="hostEmail"
              type="email"
              placeholder="name@example.com"
              value={hostEmail}
              onChange={(e) => setHostEmail(e.target.value)}
            />
          </div>

          <div className="form-field full-width">
            <label htmlFor="triviaTitle">Trivia title</label>
            <input
              id="triviaTitle"
              type="text"
              placeholder="e.g. Friday night trivia"
              value={triviaTitle}
              onChange={(e) => setTriviaTitle(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Questions */}
      <section className="questions-section">
        <div className="section-heading questions-heading">
          <div className="section-icon">
            <Lightbulb size={19} />
          </div>

          <div>
            <h2>Your questions</h2>
            <p>Add questions and select the correct answer for each one.</p>
          </div>

          <span className="question-count">
            {questions.length} {questions.length === 1 ? 'question' : 'questions'}
          </span>
        </div>

        {questions.map((q, index) => (
          <div className="question-card" key={index}>

            <div className="question-card-header">
              <div className="question-number">
                {String(index + 1).padStart(2, '0')}
              </div>

              <div className="question-header-text">
                <h3>Question {index + 1}</h3>
                <span>Enter your question and answer options</span>
              </div>

              {questions.length > 1 && (
                <button
                  type="button"
                  className="remove-question-btn"
                  onClick={() => removeQuestion(index)}
                  aria-label={`Remove question ${index + 1}`}
                >
                  <Trash2 size={17} />
                </button>
              )}
            </div>

            <div className="form-field question-input-field">
              <label>Question text</label>
              <input
                type="text"
                placeholder="e.g. What is the largest planet in our solar system?"
                value={q.text}
                onChange={(e) => updateQuestionText(index, e.target.value)}
              />
            </div>

            <div className="options-heading">
              <span>Answer options</span>
              <span className="correct-hint">
                <CheckCircle2 size={14} />
                Select the correct answer
              </span>
            </div>

            <div className="options-list">
              {q.options.map((opt, i) => (
                <div
                  className={`option-row ${opt.isCorrect ? 'correct-option' : ''}`}
                  key={i}
                >
                  <span className="option-letter">
                    {String.fromCharCode(65 + i)}
                  </span>

                  <input
                    type="text"
                    placeholder={`Enter option ${i + 1}`}
                    value={opt.text}
                    onChange={(e) => updateOptions(index, i, e.target.value)}
                  />

                  <label
                    className={`correct-toggle ${opt.isCorrect ? 'selected' : ''}`}
                    title="Mark as correct answer"
                  >
                    <input
                      type="checkbox"
                      checked={opt.isCorrect}
                      onChange={() => setCorrectOption(index, i)}
                      aria-label={`Mark option ${i + 1} as correct`}
                    />
                    <CheckCircle2 size={19} />
                  </label>

                  {q.options.length > 2 && (
                    <button
                      type="button"
                      className="remove-option-btn"
                      onClick={() => removeOption(index, i)}
                      aria-label={`Remove option ${i + 1}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              className="add-option-btn"
              onClick={() => addQuestionOption(index)}
            >
              <Plus size={16} />
              Add answer option
            </button>

          </div>
        ))}

        <button
          type="button"
          className="add-question-btn"
          onClick={() => addQuestion()}
        >
          <CirclePlus size={19} />
          Add another question
        </button>
      </section>

      {/* Submit */}
      <div className="create-footer">
        <p>
          <CheckCircle2 size={15} />
          Your trivia will be ready to share once created.
        </p>

        <button
          type="button"
          className="submit-btn"
          onClick={submitTriviaToAPI}
        >
          Create trivia
          <span>→</span>
        </button>
      </div>

    </div>
  </div>
);
}