import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidV4 } from 'uuid';

const Home = () => {
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState('');

    const createRoom = () => {
        const id = uuidV4();
        navigate(`/room/${id}`);
    };

    const joinRoom = () => {
        if (!roomId) return;
        navigate(`/room/${roomId}`);
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            backgroundColor: '#1e1e1e',
            color: '#fff',
            gap: 20
        }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: 20 }}>Collaborative Coder</h1>

            <div style={{
                background: '#252526',
                padding: 40,
                borderRadius: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
                width: 300
            }}>
                <button
                    onClick={createRoom}
                    style={{
                        padding: '12px',
                        fontSize: '16px',
                        background: '#0e639c',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: 4
                    }}
                >
                    Create New Room
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#888' }}>
                    <div style={{ height: 1, background: '#444', flex: 1 }}></div>
                    <span>OR</span>
                    <div style={{ height: 1, background: '#444', flex: 1 }}></div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                    <input
                        type="text"
                        placeholder="Enter Room ID"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        style={{
                            flex: 1,
                            padding: 10,
                            borderRadius: 4,
                            border: '1px solid #444',
                            background: '#3c3c3c',
                            color: 'white'
                        }}
                    />
                    <button
                        onClick={joinRoom}
                        style={{
                            padding: '10px 20px',
                            background: '#444',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer'
                        }}
                    >
                        Join
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;
