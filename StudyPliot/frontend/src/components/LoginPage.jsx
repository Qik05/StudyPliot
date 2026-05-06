import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';
import NavBar from './NavBar';

import person_icon from '../assets/person.png'
import email_icon from '../assets/email.png'
import password_icon from '../assets/password.png'

function LoginPage(props) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setErrorMessage('');
            const response = await axios.post('/login', { username, password });
            if (response.status === 200) {
                localStorage.setItem('username', username);
                navigate('/main');
            }
        } catch (error) {
            console.error('Error:', error);
            setErrorMessage('Your Username and\nPassword are incorrect.');
        }
    };

    const handleHomeClick = () => {
        navigate('/main');
    };

    const handleLoginClick = () => {
        navigate('/login');
    };

    const handleAboutClick = () => {
        navigate('/about');
    };

    const handleRegisterClick = () => {
        navigate('/register');
    };

    return (
        <>
            <NavBar 
                onHomeClick={handleHomeClick} 
                onLoginClick={handleLoginClick} 
                onAboutClick={handleAboutClick} 
                onRegisterClick={handleRegisterClick}
            />
            <div className="login-container">
                <div className="login-card">
                    <h2 className="login-title">Login</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="username" className="form-label"><img src={person_icon} alt="Person" /> Username:</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password" className="form-label">
                                <img src={password_icon} alt="Password" className="icon" />
                                <span>Password:</span>
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="form-input"
                            />
                        </div>
                        <button type="submit" className="submit-button">Login</button>
                        {errorMessage && <p className="error-message">{errorMessage}</p>}
                    </form>
                    <p style={{ color: '#aaa', textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem' }}>
                        Don't have an account?{' '}
                        <span
                            onClick={() => navigate('/register')}
                            style={{ color: '#3b82f6', cursor: 'pointer' }}
                        >
                            Register
                        </span>
                    </p>
                </div>
            </div>
        </>
    );
}

export default LoginPage;
