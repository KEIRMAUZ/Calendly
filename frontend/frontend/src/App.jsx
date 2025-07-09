import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Home from './components/Home';
import Profile from './components/Profile';
import CalendlyManager from './components/CalendlyManager';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  // Manejar navegación basada en URL
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/profile') {
      setCurrentPage('profile');
    } else if (path === '/calendly') {
      setCurrentPage('calendly');
    } else {
      setCurrentPage('home');
    }
  }, []);

  // Función para navegar
  const navigate = (page) => {
    setCurrentPage(page);
    if (page === 'profile') {
      window.history.pushState({}, '', '/profile');
    } else if (page === 'calendly') {
      window.history.pushState({}, '', '/calendly');
    } else {
      window.history.pushState({}, '', '/');
    }
  };

  // Escuchar cambios en el historial del navegador
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/profile') {
        setCurrentPage('profile');
      } else if (path === '/calendly') {
        setCurrentPage('calendly');
      } else {
        setCurrentPage('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        {currentPage === 'home' ? (
          <Home />
        ) : currentPage === 'profile' ? (
          <Profile />
        ) : currentPage === 'calendly' ? (
          <CalendlyManager />
        ) : (
          <Home />
        )}
      </main>
    </div>
  );
}

export default App;
