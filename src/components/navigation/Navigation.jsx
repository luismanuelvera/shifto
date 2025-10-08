import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="navigation">
      <div className="navigation__brand">
        <h1>Shifto</h1>
      </div>
      
      <div className="navigation__links">
        <Link 
          to="/" 
          className={`navigation__link ${location.pathname === '/' ? 'navigation__link--active' : ''}`}
        >
          <span>📊</span>
          Dashboard
        </Link>
        <Link 
          to="/calendar" 
          className={`navigation__link ${location.pathname === '/calendar' ? 'navigation__link--active' : ''}`}
        >
          <span>📅</span>
          Calendario
        </Link>
        <Link 
          to="/metrics" 
          className={`navigation__link ${location.pathname === '/metrics' ? 'navigation__link--active' : ''}`}
        >
          <span>📈</span>
          Métricas
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;