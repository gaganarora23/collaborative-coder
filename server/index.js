const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const axios = require('axios');
const { addUser, removeUser, updateCode, updateLanguage, updateOutput, getRoom, hasRoom } = require('./roomManager');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PISTON_API_URL = 'https://emkc.org/api/v2/piston/execute';

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', ({ roomId, userName }) => {
        socket.join(roomId);
        const user = { id: socket.id, name: userName || 'Anonymous' };
        const room = addUser(roomId, user);

        console.log(`User ${user.name} joined ${roomId}`);

        // Broadcast to room (including sender is fine for list update, but better to be explicit)
        io.to(roomId).emit('user_list_update', room.users);

        // Send init state to user
        socket.emit('init_state', {
            code: room.code,
            language: room.language,
            output: room.lastOutput
        });
    });

    socket.on('code_change', ({ roomId, code }) => {
        updateCode(roomId, code);
        socket.to(roomId).emit('code_update', code);
    });

    socket.on('lang_change', ({ roomId, language }) => {
        updateLanguage(roomId, language);
        io.to(roomId).emit('lang_update', language);
    });

    socket.on('cursor_move', ({ roomId, position, userName }) => {
        // Broadcast to others in the room
        socket.to(roomId).emit('cursor_update', {
            id: socket.id,
            userName,
            position
        });
    });

    socket.on('execute', async ({ roomId, language, sourceCode, version = '*' }) => {
        // Legacy socket execution - keeping for backward compatibility or direct socket use
        // But ideally we should route this logic to a common handler.
        try {
            console.log('Executing (Socket)', language);
            const response = await axios.post(PISTON_API_URL, {
                language,
                version,
                files: [{ content: sourceCode }]
            });
            const result = response.data;
            updateOutput(roomId, { result });
            io.to(roomId).emit('execution_result', result);
        } catch (error) {
            console.error('Execution error', error.message);
            const errPayload = { message: 'Execution failed: ' + error.message };
            updateOutput(roomId, { error: errPayload.message });
            io.to(roomId).emit('execution_error', errPayload);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        const result = removeUser(socket.id);
        if (result) {
            io.to(result.roomId).emit('user_list_update', result.room.users);
        }
    });
});

// REST API based on OpenAPI Spec
app.post('/api/execute', async (req, res) => {
    const { roomId, language, sourceCode, version = '*' } = req.body;

    if (!roomId || !language || !sourceCode) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        console.log('Executing (REST)', language);
        const response = await axios.post(PISTON_API_URL, {
            language,
            version,
            files: [{ content: sourceCode }]
        });
        const result = response.data;
        updateOutput(roomId, { result });

        // Broadcast result to room via Socket
        io.to(roomId).emit('execution_result', result);

        res.json(result);
    } catch (error) {
        console.error('Execution error', error.message);
        const errPayload = { message: 'Execution failed: ' + error.message };
        updateOutput(roomId, { error: errPayload.message });

        io.to(roomId).emit('execution_error', errPayload);
        res.status(500).json(errPayload);
    }
});

app.get('/api/rooms/:roomId', (req, res) => {
    const { roomId } = req.params;
    if (!hasRoom(roomId)) {
        return res.status(404).json({ exists: false });
    }
    const room = getRoom(roomId);
    res.json({
        exists: true,
        language: room.language,
        usersCount: room.users.length
    });
});

const PORT = process.env.PORT || 3001;
// Export server for testing if needed, or run it
if (require.main === module) {
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = server;
