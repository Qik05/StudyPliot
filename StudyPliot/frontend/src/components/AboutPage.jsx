import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AboutPage.css';
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
        const handleRegisterClick = () => {
    navigate('/register');
       
        }
    return (
        <>
            <NavBar 
                onHomeClick={handleHomeClick} 
                onLoginClick={handleLoginClick} 
                onAboutClick={handleAboutClick} 
                onRegisterClick={handleRegisterClick}
            />
            <div className="about-container">
                <div className="about-content">
                    <div className="about-card">
                        <h2 className="about-title">StudyPilot AI Study Planning Assistant</h2>
                        <p className="about-text">
                            Overview
                        </p>
                        <p className="about-text">
                            StudyPilot is an AI-powered academic planning application designed to help students organize coursework and manage their study time more effectively. The system allows users to track their classes and assignments while generating personalized study schedules based on deadlines, workload, and availability.

Many students struggle to keep track of assignments across multiple platforms such as learning management systems, calendars, and notes. StudyPilot centralizes this information and uses AI to create a structured study plan to help students stay organized and meet deadlines.

This project is being developed as part of COSC 412 Software Engineering.
                        </p>
                        <p className="about-text">
                            
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AboutPage;
