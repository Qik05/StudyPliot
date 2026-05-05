import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from './NavBar';
import '../styles/MainPage.css';

const ACCEPTED_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

function MainPage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [initialGreeting, setInitialGreeting] = useState("Hey! I'm StudyPilot 👋 What are you working on today? Feel free to upload any files too!");
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hey! I'm StudyPilot 👋 What are you working on today? Feel free to upload any files too!" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [attachedFile, setAttachedFile] = useState(null);
    const [fileError, setFileError] = useState('');
    const bottomRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUsername(storedUsername);
            const personalized = `Hey ${storedUsername}! 👋 I'm StudyPilot. What are you working on today? Feel free to upload any files too!`;
            setInitialGreeting(personalized);
            setMessages([{ role: 'assistant', content: personalized }]);
        }
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const processFile = (file) => {
        return new Promise((resolve, reject) => {
            if (!ACCEPTED_TYPES.includes(file.type)) {
                reject('Unsupported file type. Please upload a PDF, image, or text file.');
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                reject('File too large. Max size is 10MB.');
                return;
            }

            const reader = new FileReader();

            if (file.type === 'text/plain') {
                reader.onload = (e) => resolve({
                    name: file.name,
                    mediaType: file.type,
                    data: null,
                    textContent: e.target.result,
                });
                reader.onerror = () => reject('Failed to read file.');
                reader.readAsText(file);
                return;
            }

            if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                resolve({
                    name: file.name,
                    mediaType: file.type,
                    data: null,
                    textContent: `[Word document: ${file.name}] — Word docs cannot be fully parsed in the browser. Please copy and paste the key content into the chat for best results.`,
                });
                return;
            }

            reader.onload = (e) => {
                const base64 = e.target.result.split(',')[1];
                resolve({
                    name: file.name,
                    mediaType: file.type,
                    data: base64,
                    textContent: null,
                });
            };
            reader.onerror = () => reject('Failed to read file.');
            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const processed = await processFile(file);
            setAttachedFile(processed);
            setFileError('');
        } catch (err) {
            setFileError(err);
            setAttachedFile(null);
        }
        e.target.value = '';
    };

    const removeFile = () => {
        setAttachedFile(null);
        setFileError('');
    };

    const sendMessage = async () => {
        const trimmed = input.trim();
        if ((!trimmed && !attachedFile) || loading) return;

        const userText = trimmed || `I uploaded: ${attachedFile.name}`;
        const newMessages = [...messages, { role: 'user', content: userText }];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        const fileToSend = attachedFile;
        setAttachedFile(null);

        try {
            // If there's a file, upload it first
            if (fileToSend && fileToSend.mediaType === 'application/pdf') {
                const formData = new FormData();
                const binaryString = atob(fileToSend.data);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                const blob = new Blob([bytes], { type: 'application/pdf' });
                const file = new File([blob], fileToSend.name, { type: 'application/pdf' });

                formData.append('file', file);
                formData.append('username', username);

                try {
                    const uploadRes = await axios.post('/api/upload', formData);
                    console.log('File uploaded successfully:', uploadRes.data);
                } catch (uploadError) {
                    console.error('File upload failed:', uploadError.response?.data || uploadError.message);
                    setMessages([...newMessages, {
                        role: 'assistant',
                        content: `I couldn't save your PDF to your files. Error: ${uploadError.response?.data?.message || uploadError.message}. I can still help you with it though!`,
                    }]);
                    setLoading(false);
                    return;
                }
            }

            // Then send to chat
            const response = await axios.post('/api/chat', {
                messages: newMessages,
                file: fileToSend || null,
                username: username,
            });
            setMessages([...newMessages, { role: 'assistant', content: response.data.reply }]);
        } catch (error) {
            console.error('Error:', error);
            setMessages([...newMessages, {
                role: 'assistant',
                content: "Sorry, something went wrong. Try again in a sec!",
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

                    {attachedFile && (
                        <div className="file-preview">
                            <span className="file-preview-icon">📎</span>
                            <span className="file-preview-name">{attachedFile.name}</span>
                            <button className="file-preview-remove" onClick={removeFile}>✕</button>
                        </div>
                    )}

                    {fileError && (
                        <div className="file-error">{fileError}</div>
                    )}

                    <div className="chat-input-bar">
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.txt,.docx"
                            onChange={handleFileChange}
                        />

                        <button
                            className="chat-attach-btn"
                            onClick={() => fileInputRef.current.click()}
                            title="Attach a file"
                            disabled={loading}
                        >
                            📎
                        </button>

                        <textarea
                            className="chat-input"
                            rows={1}
                            placeholder="Message StudyPilot or attach a file..."
                            value={input}
                            onChange={(e) => {
                            setInput(e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
}}
                            onKeyDown={handleKeyDown}
                        />

                        <button
                            className="chat-send-btn"
                            onClick={sendMessage}
                            disabled={loading || (!input.trim() && !attachedFile)}
                        >
                            Send
                        </button>
                    </div>

                    <p className="chat-hint">Press Enter to send · Shift+Enter for new line · 📎 to attach a file</p>
                </div>
            </div>
        </>
    );
}

export default MainPage;
