import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import './styles/LandingPage.css';
import './styles/Login.css';
import './styles/HomeScreen.css';
import './styles/dashboard.css';

import LandingPage from './pages/LandingPage';
import HomeScreen from './pages/user/HomeScreen';
import AdminDashboard from './pages/admin/dashboard';
import VetDashboard from './pages/vet/vetDashboard';
import Preloader from './pages/Preloader';

function App() {
  return (
    <>
      <Preloader />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/HomeScreen" element={<HomeScreen />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/vet/vetDashboard" element={<VetDashboard />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
