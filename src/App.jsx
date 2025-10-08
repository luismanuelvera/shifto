import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { ShiftProvider } from './context/ShiftContext';
import Navigation from './components/navigation/Navigation';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Metrics from './pages/Metrics';
import './App.css';

function App() {
  return (
    <UserProvider>
      <ShiftProvider>
        <Router basename="/shifto">
          <div className="app">
            <Navigation />
            <main className="app__main">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/metrics" element={<Metrics />} />
              </Routes>
            </main>
          </div>
        </Router>
      </ShiftProvider>
    </UserProvider>
  );
}

export default App;
