import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { SoundProvider } from './components/SoundManager';
import End from './pages/End';
import GameMenu from './pages/GameMenu';
import MainMenu from './pages/MainMenu';
import Pong from './pages/Pong';
import SpaceInvaders from './pages/SpaceInvaders';

function App() {
  return (
    <SoundProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainMenu />} />
          <Route path="/menu" element={<GameMenu />} />
          <Route path="/space-invaders" element={<SpaceInvaders />} />
          <Route path="/pong" element={<Pong />} />
          <Route path="/end" element={<End />} />
        </Routes>
      </Router>
    </SoundProvider>
  );
}

export default App;
