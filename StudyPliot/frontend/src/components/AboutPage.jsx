import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AboutPage.css';
import NavBar from './NavBar';

function AboutPage() {
    const navigate = useNavigate();

    const handleHomeClick = () => {
        navigate('/main');
    };

    const handleLoginClick = () => {
        navigate('/login');
    };

    const handleAboutClick = () => {
        navigate('/about');
    };

    return (
        <>
            <NavBar 
                onHomeClick={handleHomeClick} 
                onLoginClick={handleLoginClick} 
                onAboutClick={handleAboutClick} 
            />
            <div className="about-container">
                <div className="about-content">
                    <div className="about-card">
                        <h2 className="about-title">About Us</h2>
                        <p className="about-text">
                            Welcome to Study Pilot
                        </p>
                        <p className="about-text">
                            67
                        </p>
                        <p className="about-text">
                            67
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AboutPage;
