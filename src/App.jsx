
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { ShiftProvider } from './context/ShiftContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navigation from './components/navigation/Navigation';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Metrics from './pages/Metrics';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import './App.css';


function ProtectedRoutes() {
  const { user } = useAuth();
  if (!user) {
    return <Auth />;
  }
  // Si falta algún dato básico, mostrar pantalla de datos básicos
  const missingBasic = !user.nombre || !user.apellido || !user.telefono || !user.profesion;
  if (missingBasic) {
    return <Auth onAuthSuccess={null} />;
  }
  return (
    <div className="app">
      <Navigation />
      <main className="app__main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/metrics" element={<Metrics />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <ShiftProvider>
          <Router basename="/shifto">
            <ProtectedRoutes />
          </Router>
        </ShiftProvider>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;
