import React from 'react';
import '../styles/NavBar.css';

const NavBar = ({ onLoginClick, onHomeClick, onAboutClick, onRegisterClick }) => {
  return (
    <nav className="navbar">
      <div className="navbar-title">Study Pilot</div>

      <div className="navbar-buttons">
        <button className="nav-button" onClick={onHomeClick}>Home</button>
        <button className="nav-button" onClick={onLoginClick}>Log In</button>
        <button className="nav-button" onClick={onRegisterClick}>Register</button>
        <button className="nav-button" onClick={onAboutClick}>About</button>
      </div>
    </nav>
  );
};

export default NavBar;