
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/home.css';
import { CirclePlus, Gamepad2 } from 'lucide-react';
import logo from '../assets/image.png';

function App() {
  const [roomCode, setRoomCode] = useState('');
  const navigate = useNavigate();

  function handleJoin(e) {
    e.preventDefault();

    const code = roomCode.trim().toUpperCase();

    if (!code) return;

    navigate(`/play/${encodeURIComponent(code)}`);
  }

  return (
    <div className="home-page">

      {/* Navigation */}
      <nav className="navigation">
        <div className="nav-container">
          <div className="logo-section">
            <div className="logo-icon">✦</div>

            <span className="logo-text">
              Trivia<span>Hub</span>
            </span>
          </div>

          <div className="nav-tag">
            <span className="online-dot"></span>
            No sign-up required
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="main-container">

        {/* Hero */}
        <section className="hero-section">
          <p className="hero-eyebrow">TRIVIA MADE SIMPLE</p>

          <h1>
            Think you know it all?
            <span> Prove it.</span>
          </h1>

          <p className="hero-description">
            Create a trivia, challenge your friends, and see
            who comes out on top. No accounts, no complicated
            setup. Just trivia.
          </p>
        </section>

        {/* Main actions */}
        <section className="action-grid">

          {/* Create trivia */}
          <div className="action-card host-card">

            <div className="card-top">
              <div className="card-icon purple-icon">
                <CirclePlus size={28} />
              </div>

              <span className="card-label">
                FOR HOSTS
              </span>
            </div>

            <div className="card-content">
              <h2>Create a trivia</h2>

              <p>
                Build your own quiz, add questions, and
                invite people to compete. You're in control
                of the game.
              </p>
            </div>

            <button
              className="action-button create-button"
              onClick={() => navigate('/new-trivia')}
            >
              Create Trivia
              <span>→</span>
            </button>

            <span className="card-decoration">CREATE</span>
          </div>

          {/* Join trivia */}
          <div className="action-card join-card">

            <div className="card-top">
              <div className="card-icon blue-icon">
                <Gamepad2 size={28} />
              </div>

              <span className="card-label">
                FOR PLAYERS
              </span>
            </div>

            <div className="card-content">
              <h2>Join a trivia</h2>

              <p>
                Someone already created a game?
                Enter their room code and jump straight
                into the competition.
              </p>
            </div>

            <form className="join-form" onSubmit={handleJoin}>
              <input
                type="text"
                placeholder="Enter room code"
                value={roomCode}
                onChange={(e) =>
                  setRoomCode(e.target.value.toUpperCase())
                }
                maxLength={20}
                autoComplete="off"
                required
              />

              <button
                type="submit"
                className="action-button join-button"
              >
                Join Game
                <span>→</span>
              </button>
            </form>

            <span className="card-decoration">COMPETE</span>
          </div>

        </section>

        {/* Value proposition */}
        <section className="bottom-section">
          <div className="bottom-line"></div>

          <div className="bottom-content">
            <span>NO ACCOUNTS</span>
            <span className="bottom-star">&#183;</span>
            <span>NO HASSLE</span>
            <span className="bottom-star">&#183;</span>
            <span>JUST TRIVIA</span>
          </div>

          <div className="bottom-line"></div>
        </section>

      </main>

      {/* Footer */}
      <footer className="footer">
        <p>TriviaHub &copy; 2026. Think fast. Play smart.</p>
      </footer>

    </div>
  );
}

export default App;
