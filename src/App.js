import React, { useState } from 'react';
import './App.css';
import './styles/LandingPage.css';
import './styles/Login.css';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';

function App() {
  const [showLogin, setShowLogin] = useState(false);

  const handleLoginClick = () => {
    setShowLogin(true);
  };

  return (
    <div className="App">
      {!showLogin ? (
        <LandingPage onLoginClick={handleLoginClick} />
      ) : (
        <Login />
      )}
  </div>
  );
}

export default App;
