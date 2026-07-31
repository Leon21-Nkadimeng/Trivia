import { useState } from 'react'
import './assets/styles/home.css'
function App() {
  const [count, setCount] = useState(0)

  return (
    
    <div className='page-container'>
      <div className='navigation'>
        <div className='logo-section'>
          <img src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8vly21Ryw8cifCqV3XvvkUeEAd0_7Q_JNInXmuHv6FRJ3YdyDgA5e2wo&s=10' className='logo' />
        </div>
      </div>
      <div className='main'>
        <div className='host-section'>
          <h1>Host a trivia in minutes</h1>
          
          <div className='prompt-section'>
            <span>
              Create a quiz, share a code, and watch the leaderboard fill up
              </span>
          </div>
          <div className='signup-or-login-section'>
            <button onClick={() => window.location.href='./new-trivia.jsx'}>Create Trivia</button>
          </div>
        </div>
        <div className='join-section'>
          <h1>Join a trivia in seconds</h1>
          <div className='prompt-section'>
            <span>
              Enter a room code then your display name to participate in a trivia
            </span>
          </div>
          <div className='join-room-section'>
            <input type='text' className='room-code-input' placeholder='Enter room code' />
            <button className='join-button'>Join</button>
          </div>
        </div>
        <div className=''>

        </div>
      </div>
    </div>
    
  )
}

export default App
