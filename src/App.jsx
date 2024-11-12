import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import MainMenu from './pages/MainMenu';
import SpaceInvaders from './pages/SpaceInvaders';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/space-invaders" element={<SpaceInvaders />} />
        {/* Autres routes pour les pages de jeu */}
      </Routes>
    </Router>
  );
}

export default App;
