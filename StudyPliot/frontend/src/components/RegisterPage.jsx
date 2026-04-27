import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';
import NavBar from './NavBar';

import person_icon from '../assets/person.png';
import password_icon from '../assets/password.png';

function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            const response = await axios.post('http://localhost:3000/register', {
                username,
                password
            });

            setMessage(response.data.message);
            setUsername('');
            setPassword('');
        } catch (error) {
            setMessage(error.response?.data?.message || 'Something went wrong.');
        }
    };

    return (
        <>
          <NavBar
    onHomeClick={() => navigate('/main')}
    onLoginClick={() => navigate('/login')}
    onRegisterClick={() => navigate('/register')}
    onAboutClick={() => navigate('/about')}
/>

            <div className="login-container">
                <div className="login-card">
                    <h2 className="login-title">Add New User</h2>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">
                                <img src={person_icon} alt="Person" className="icon" />
                                <span>Username:</span>
                            </label>

                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="form-input"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <img src={password_icon} alt="Password" className="icon" />
                                <span>Password:</span>
                            </label>

                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="form-input"
                                required
                            />
                        </div>

                        <button type="submit" className="submit-button">
                            Add User
                        </button>

                        {message && <p className="error-message">{message}</p>}
                    </form>

                    <p style={{ color: '#aaa', textAlign: 'center', marginTop: '1rem' }}>
                        Back to{' '}
                        <span
                            onClick={() => navigate('/login')}
                            style={{ color: '#3b82f6', cursor: 'pointer' }}
                        >
                            Login
                        </span>
                    </p>
                </div>
            </div>
        </>
    );
}

export default RegisterPage;