import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import KppOfficerDashboard from './components/KppOfficerDashboard';
import UnitOfficerDashboard from './components/UnitOfficerDashboard';
import AdminDashboard from './components/AdminDashboard';
import Header from './components/Header';
import './styles/App.scss';

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedToken = localStorage.getItem('authToken');
    
    if (savedUser && savedToken) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
      } catch (error) {
        console.error('Помилка парсингу користувача:', error);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
      }
    }
    
    setIsLoading(false);
  }, []);

  const handleLogin = (user, token) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('authToken', token);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
  };

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Завантаження...</p>
      </div>
    );
  }

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <div className="app">
        {currentUser && <Header user={currentUser} onLogout={handleLogout} />}
        
        <main className="main-content">
          <Routes>
            <Route 
              path="/login" 
              element={
                currentUser ? 
                  <Navigate to="/" replace /> : 
                  <LoginPage onLogin={handleLogin} />
              } 
            />
            
            <Route 
              path="/" 
              element={
                currentUser ? (
                  currentUser.role === 'admin' ? (
                    <AdminDashboard user={currentUser} />
                  ) : currentUser.role === 'kpp_officer' ? (
                    <KppOfficerDashboard user={currentUser} />
                  ) : (
                    <UnitOfficerDashboard user={currentUser} />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            
            {/* Redirect всіх інших маршрутів на головну */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
