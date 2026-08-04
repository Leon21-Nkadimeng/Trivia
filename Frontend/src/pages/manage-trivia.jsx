import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTriviaForManagement, stopTrivia } from "../services/trivia.service";

import '../assets/styles/manage-trivia.css';
import { formatDuration } from "../utils/utils";
export default function ManageTrivia() {
  const {adminToken} = useParams();
  const [trivia, setTrivia] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if(!adminToken)
      navigate('/');
    async function load() {
      const res = await getTriviaForManagement(adminToken);
      const data = await res.json();
      setTrivia(data.trivia);
      setLeaderboard(data.leaderboard);
      console.log(data);
    }

    load();
    
  }, []);

  async function handleStopTrivia(token) {
    try {
      const res = await stopTrivia(token);
      if(!res.ok) {
        alert('something went wrong. Try again later');
        navigate("/");
      }

      const data = await res.json();
      alert(data.message);
      navigate(0);
    } catch (error) {
      alert('something went wrong. Try again later');
      navigate("/");
    }
  }

  async function handleCopy(RoomCode) {
    // save to clipboard
    await navigator.clipboard.writeText(RoomCode);
    setCopied(true);

    // change the copy button icon after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  
  


  return (
    
    <div className="manage-trivia-page">
      <div className="manage-header">
        <p className="eyebrow">Manage trivia</p>
        <h1>{trivia.TriviaTitle}</h1>
        <p className="subtext">Created by: {trivia.AdminName} &bull; {trivia.questions} questions</p>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <p className="stat-label">Room code</p>
          <div className="room-code-row">
            <span className="code-text">{trivia.RoomCode}</span>
            <button className="copy-icon-btn" type="button" onClick={() => {handleCopy(trivia.RoomCode)}}>
              {copied ? '✓' : '⧉'}
            </button>
          </div>
        </div>
        <div className="stat-card">
          <p className="stat-label">Participants</p>
          <span className="stat-value">{trivia.participants}</span>
        </div>
      </div>

      <div className="leaderboard-section">
        <h3>Leaderboard</h3>
        {leaderboard.length === 0 ? (
          <p className="empty-leaderboard">{trivia.Status === 'Open' ? 'No one has played yet - share your room code so people can start participating.' : 'No one played, make a new trivia and invite people.'}</p>
        ) : (
          <div className="leaderboard-list">
            {leaderboard.map((entry, i) => (
              <div className={`leaderboard-row ${i === 0 ? 'first-place' : ''}`} key={i}>
                <span className="rank">{i + 1}</span>
                <span className="participant-name">{entry.AttemptName}</span>
                <span className="time-taken">{formatDuration(entry.attempt_time_minutes)}</span>
                <span className="score">{entry.correct_answers}/{trivia.questions}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {trivia.Status === 'Open' &&
      <button className="delete-trivia-btn" type="button" onClick={() => handleStopTrivia(adminToken)}>
        Stop Trivia
      </button>
      }
    </div>
  );
}