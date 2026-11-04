import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTriviaForManagement, stopTrivia } from "../services/trivia.service";

import '../assets/styles/manage-trivia.css';
import { formatDuration } from "../utils/utils";
import socket from "../socket";
import {
  Copy,
  Check,
  Trophy,
  Users,
  Clock3,
  SquareStop,
  CircleHelp,
  Hash
} from 'lucide-react';
export default function ManageTrivia() {
  const {adminToken} = useParams();
  const [trivia, setTrivia] = useState({});
  const [participants, setParticipants] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [copied, setCopied] = useState(false);

  const [status, setStatus] = useState("Disconnected");
  const navigate = useNavigate();

  useEffect(() => {
    if(!adminToken)
      navigate('/');
    
    async function load() {
      const res = await getTriviaForManagement(adminToken);
      const data = await res.json();
      setTrivia(data.trivia);
      setLeaderboard(data.leaderboard);
      setParticipants(data.leaderboard.length)
      console.log(data);
    }

    load();
    
  }, []);


  useEffect(() => {
    if(!adminToken) return;
    

    function handleConnect() {
      console.log("Connected to socket.io:",socket.id);
      setStatus("Connected");

      socket.emit("register", adminToken);
    }

    function handleDisconnect(reason) {
      console.log("Socket disconnected:", reason);
      setStatus("Disconnected");
    }


    function handleConnectError(error) {
      console.error("Socket connection error:", error.message);
      setStatus("Connection failed");
    }

    function handleLeaderboardUpdate(updatedLeaderboard) {
      console.log("Leaderboard updated:", updatedLeaderboard);
      setParticipants(updatedLeaderboard.length)
      setLeaderboard(updatedLeaderboard);
    }


    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("leaderboard:update", handleLeaderboardUpdate);

    socket.connect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("leaderboard:update", handleLeaderboardUpdate);

      socket.disconnect();
    };
  }, [adminToken]);


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
    }, 2500);
  }

return (
  <div className="manage-trivia-page">
    <div className="manage-container">

      {/* Header */}
      <header className="manage-header">
        <p className="eyebrow">TRIVIA MANAGEMENT</p>

        <div className="manage-title-row">
          <div>
            <h1>{trivia.TriviaTitle}</h1>
            <p className="subtext">
              Created by {trivia.AdminName}
            </p>
          </div>

          <span className={`status-badge ${trivia.Status === 'Open' ? 'status-open' : 'status-closed'}`}>
            <span className="status-dot"></span>
            {trivia.Status}
          </span>
        </div>

        <div className="trivia-meta">
          <span>
            <CircleHelp size={15} />
            {trivia.questions} {trivia.questions === 1 ? 'question' : 'questions'}
          </span>
          <span>
            <Users size={15} />
            {trivia.participants} {trivia.participants === 1 ? 'participant' : 'participants'}
          </span>
        </div>
      </header>

      {/* Overview */}
      <section className="stats-row">

        <div className="stat-card room-code-card">
          <div className="stat-card-heading">
            <span className="stat-label">ROOM CODE</span>
            <span className="stat-icon"><Hash size={19} /></span>
          </div>

          <div className="room-code-row">
            <span className="code-text">{trivia.RoomCode}</span>

            <button
              className="copy-icon-btn"
              type="button"
              onClick={() => handleCopy(trivia.RoomCode)}
              aria-label="Copy room code"
              title="Copy room code"
            >
              {copied ? <Check size={19} /> : <Copy size={19} />}
            </button>
          </div>

          <p className="stat-description">
            Share this code with participants.
          </p>
        </div>

        <div className="stat-card participants-card">
          <div className="stat-card-heading">
            <span className="stat-label">PARTICIPANTS</span>
            <span className="stat-icon"><Users size={18} /></span>
          </div>

          <span className="stat-value">{participants}</span>

          <p className="stat-description">
            People who have participated.
          </p>
        </div>

      </section>

      {/* Leaderboard */}
      <section className="leaderboard-section">
        <div className="leaderboard-header">
          <div>
            <h2>Leaderboard</h2>
            <p>See how everyone performed.</p>
          </div>

          <Trophy size={22} className="leaderboard-icon" />
        </div>

        {leaderboard.length === 0 ? (
          <div className="empty-leaderboard">
            <div className="empty-icon">
              <Trophy size={26} />
            </div>

            <h3>No participants yet</h3>

            <p>
              {trivia.Status === 'Open'
                ? 'Share your room code to get the competition started.'
                : 'Nobody participated in this trivia.'}
            </p>
          </div>
        ) : (
          <div className="leaderboard-list">

            <div className="leaderboard-column-labels">
              <span>RANK / PLAYER</span>
              <span>TIME</span>
              <span>SCORE</span>
            </div>

            {leaderboard.map((entry, i) => (
              <div
                className={`leaderboard-row ${i === 0 ? 'first-place' : ''}`}
                key={entry.ID ?? `${entry.AttemptName}-${i}`}
              >
                <div className="player-info">
                  <span className="rank">{i + 1}</span>

                  <div className="participant-details">
                    <span className="participant-name">
                      {entry.AttemptName}
                    </span>

                    {i === 0 && (
                      <span className="winner-label">Top performer</span>
                    )}
                  </div>
                </div>

                <span className="time-taken">
                  <Clock3 size={14} />
                  {formatDuration(entry.attempt_time_minutes)}
                </span>

                <span className="score">
                  {entry.correct_answers}
                  <span> / {trivia.questions}</span>
                </span>
              </div>
            ))}

          </div>
        )}
      </section>

      {/* Stop trivia */}
      {trivia.Status === 'Open' && (
        <div className="manage-actions">
          <button
            className="stop-trivia-btn"
            type="button"
            onClick={() => handleStopTrivia(adminToken)}
          >
            <SquareStop size={17} />
            Stop trivia
          </button>

          <p>
            Stopping the trivia prevents further participation.
          </p>
        </div>
      )}

    </div>
  </div>
);
}