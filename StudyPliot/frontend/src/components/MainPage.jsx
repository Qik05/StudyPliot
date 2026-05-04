import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from './NavBar';
import '../styles/MainPage.css';

function MainPage() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hey! I'm StudyPilot 👋 What are you working on today?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    // Auto-scroll to latest message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const sendMessage = async () => {
        const trimmed = input.trim();
        if (!trimmed || loading) return;

        // Add user message to display
        const newMessages = [...messages, { role: 'user', content: trimmed }];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            // Send full conversation history to backend
            const response = await axios.post('/api/chat', {
                messages: newMessages
            });

            setMessages([...newMessages, { role: 'assistant', content: response.data.reply }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages([...newMessages, {
                role: 'assistant',
                content: "Sorry, something went wrong. Try again in a sec!"
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            <NavBar
                onHomeClick={() => navigate('/main')}
                onLoginClick={() => navigate('/login')}
                onAboutClick={() => navigate('/about')}
                onRegisterClick={() => navigate('/register')}
            />

            <div className="main-container">
                <div className="chat-wrapper">

                    {/* Chat messages */}
                    <div className="chat-messages">
                        {messages.map((msg, i) => (
                            <div key={i} className={`chat-bubble-row ${msg.role}`}>
                                <div className={`chat-bubble ${msg.role}`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="chat-bubble-row assistant">
                                <div className="chat-bubble assistant typing">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}

                        <div ref={bottomRef} />
                    </div>

                    {/* Input bar */}
                    <div className="chat-input-bar">
                        <textarea
                            className="chat-input"
                            rows={1}
                            placeholder="Message StudyPilot..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button
                            className="chat-send-btn"
                            onClick={sendMessage}
                            disabled={loading || !input.trim()}
                        >
                            Send
                        </button>
                    </div>

                    <p className="chat-hint">Press Enter to send · Shift+Enter for new line</p>
                </div>
            </div>
        </>
    );
}

export default MainPage;