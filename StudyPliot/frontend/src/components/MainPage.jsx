import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import '../styles/MainPage.css'; // Import CSS file
import NavBar from './NavBar'; // Import NavBar component

function MainPage(props) {
    const navigate = useNavigate(); // Initialize useNavigate hook

    const handleLogout = () => {
        navigate('/login');
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
            <div className="main-container">
                <div className="main-content">
                    <div className="main-card">
                        <p className="main-title">Main Page</p>
                        <button onClick={handleLogout} className="logout-button">
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default MainPage;
