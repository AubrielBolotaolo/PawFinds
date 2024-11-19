import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import './styles/LandingPage.css';
import './styles/Login.css';
import './styles/HomeScreen.css';

import LandingPage from './pages/LandingPage';
import HomeScreen from './pages/HomeScreen';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/HomeScreen" element={<HomeScreen />} />
      </Routes>
    </Router>
  );
}

export default App;
