import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import CreateTrivia from './pages/new-trivia';
import ManageTrivia from './pages/manage-trivia';
import PlayTrivia from './pages/play-trivia';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/new-trivia' element={<CreateTrivia />} />
        
        <Route path='/manage/:adminToken' element={<ManageTrivia />} />
        
        <Route path='/play/:roomCode' element={<PlayTrivia />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;