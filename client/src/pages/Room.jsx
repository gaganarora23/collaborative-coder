import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import CodeEditor from '../components/CodeEditor';
import Controls, { LANGUAGES } from '../components/Controls';
import UserList from '../components/UserList';
import Output from '../components/Output';

const SOCKET_URL = 'http://localhost:3001';

const Room = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();

    const [socket, setSocket] = useState(null);
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [code, setCode] = useState('// Start coding...');
    const [language, setLanguage] = useState('javascript');
    const [output, setOutput] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const initialized = useRef(false);

    useEffect(() => {
        if (!roomId) {
            navigate('/');
            return;
        }

        if (initialized.current) return;
        initialized.current = true;

        // Prompt Name
        let name = window.prompt('Enter your name:', 'Guest');
        if (!name) name = 'Guest';
        setCurrentUser({ name });

        // Connect Socket
        const s = io(SOCKET_URL);
        setSocket(s);

        s.on('connect', () => {
            console.log('Connected', s.id);
            setCurrentUser(u => ({ ...u, id: s.id }));
            s.emit('join', { roomId, userName: name });
        });

        s.on('init_state', (state) => {
            setCode(state.code);
            setLanguage(state.language);
            if (state.output) {
                if (state.output.result) setOutput(state.output.result);
                if (state.output.error) setError(state.output.error);
            }
        });

        s.on('code_update', (newCode) => {
            setCode(newCode);
        });

        s.on('lang_update', (newLang) => {
            setLanguage(newLang);
        });

        s.on('user_list_update', (list) => {
            setUsers(list);
        });

        s.on('execution_result', (res) => {
            setLoading(false);
            setOutput(res);
        });

        s.on('execution_error', (err) => {
            setLoading(false);
            setError(err.message);
        });

        // No cleanup returning disconnect for singleton strict mode persistence
    }, [roomId, navigate]);

    const handleCodeChange = (newCode) => {
        if (socket) {
            socket.emit('code_change', { roomId, code: newCode });
        }
        setCode(newCode);
    };

    const handleLanguageChange = (newLang) => {
        if (socket) {
            socket.emit('lang_change', { roomId, language: newLang });
        }
        setLanguage(newLang);
    };

    const handleRun = async () => {
        if (!socket) return;
        setLoading(true);
        setError(null);
        setOutput(null);
        const langObj = LANGUAGES.find(l => l.id === language);

        try {
            // Use REST API for execution
            await axios.post(`${SOCKET_URL}/api/execute`, {
                roomId,
                language,
                sourceCode: code,
                version: langObj ? langObj.version : '*'
            });
            // Result will come back via socket broadcast 'execution_result'
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || err.message);
        }
    };

    const handeShare = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    };

    return (
        <div className="app">
            <header className="header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button onClick={() => navigate('/')} style={{ background: 'transparent', border: 'none', fontSize: 18, cursor: 'pointer' }}>🏠</button>
                    <h2 style={{ margin: 0, fontSize: 18 }}>Collaborative Coder</h2>
                    <span style={{ fontSize: 12, color: '#888' }}>Room: {roomId}</span>
                </div>
                <div className="controls">
                    <button onClick={handeShare} style={{ background: '#333' }}>Share Link</button>
                    <Controls
                        language={language}
                        onLanguageChange={handleLanguageChange}
                        onRun={handleRun}
                        loading={loading}
                    />
                </div>
            </header>
            <div className="main-content">
                <aside className="sidebar">
                    <UserList users={users} currentUser={currentUser} />
                </aside>
                <div className="editor-container">
                    <CodeEditor
                        code={code}
                        language={language}
                        onChange={handleCodeChange}
                        socket={socket}
                        roomId={roomId}
                        currentUser={currentUser}
                    />
                    <div style={{ height: '30%', borderTop: '1px solid #333' }}>
                        <Output result={output} error={error} loading={loading} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Room;
