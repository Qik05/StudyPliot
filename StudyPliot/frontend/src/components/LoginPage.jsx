// Import React and necessary hooks
import React, { useState } from 'react';
import axios from 'axios'; // Import Axios
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import './LoginPage.css'; // Import CSS file
import NavBar from './NavBar'; // Import NavBar component

// Import icons
import person_icon from '../assets/person.png'
import email_icon from '../assets/email.png'
import password_icon from '../assets/password.png'


function LoginPage(props) {
    // State variables for username, password, and error message
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Initialize useNavigate hook for navigation
    const navigate = useNavigate();

    // Function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Clear previous error messages
            setErrorMessage('');

            // Send login request to server
            const response = await axios.post('http://localhost:3000/login', { username, password });

            // If login successful, redirect to MainPage
            if (response.status === 200) {
                navigate('/main');
            }
        } catch (error) {
            console.error('Error:', error);

            // If login failed, display error message
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

    // JSX structure for login form
    return (
        <>
            <NavBar 
                onHomeClick={handleHomeClick} 
                onLoginClick={handleLoginClick} 
                onAboutClick={handleAboutClick} 
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
                    {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Display error message if exists */}
                </form>
            </div>
            </div>
        </>
    );
}

export default LoginPage;
