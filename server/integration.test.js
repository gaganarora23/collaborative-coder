const request = require('supertest');
const Client = require('socket.io-client');
const http = require('http');

// Mock axios to avoid real network calls to Piston
const axios = require('axios');
jest.mock('axios');

// We need to require the server, but nicely handle port conflicts if testing in parallel or if start logic runs
// Our index.js exports 'server' and only listens if main. So we can use it.
const server = require('./index');

describe('Full Stack Client-Server Interaction', () => {
    let clientSocket;
    let port;

    beforeAll((done) => {
        // Setup mock response
        axios.post.mockResolvedValue({
            data: {
                run: { output: 'Mocked Execution Output\n' },
                language: 'python'
            }
        });

        // Start the server on a random port for testing
        // Note: server.listen is not called in index.js when imported, so we call it here.
        server.listen(0, () => {
            port = server.address().port;
            done();
        });
    });

    afterAll((done) => {
        server.close(done);
        if (clientSocket) clientSocket.close();
    });

    test('REST Execution should broadcast to Socket Client', (done) => {
        const roomId = 'verify-interaction-room';
        const sourceCode = 'print("Integration Test")';

        // 1. Connect a Socket Client to the room
        clientSocket = new Client(`http://localhost:${port}`);

        clientSocket.on('connect', () => {
            // Join Room
            clientSocket.emit('join', { roomId, userName: 'TestUser' });
        });

        // 2. Listen for execution_result (This verifies Server -> Client interaction via Socket)
        clientSocket.on('execution_result', (data) => {
            try {
                // Verify Piston execution result structure
                expect(data).toHaveProperty('run');
                done();
            } catch (error) {
                done(error);
            }
        });

        // 3. Trigger Execution via REST API (Simulating the Client's Run button)
        // Ensure user has joined first
        setTimeout(async () => {
            try {
                console.log('Test: Verifying Room via API...');
                // Verify Room Exists via API first
                const roomRes = await request(server).get(`/api/rooms/${roomId}`);
                expect(roomRes.status).toBe(200);
                expect(roomRes.body.usersCount).toBe(1);

                console.log('Test: Initializing Execution Request...');
                // Execute
                const res = await request(server)
                    .post('/api/execute')
                    .send({
                        roomId,
                        language: 'python',
                        sourceCode,
                        version: '3.10.0'
                    });

                console.log('Test: Execution Response received', res.status);
                expect(res.status).toBe(200);
                expect(res.body).toHaveProperty('run');

                // If we get here, REST part worked. 
                // We still wait for socket event to call done(), unless it already happened.
                // But socket event might happen BEFORE or AFTER response.
            } catch (err) {
                console.error('Test Error:', err);
                done(err);
            }
        }, 500); // Small delay to ensure join completes
    }, 15000); // 15s timeout

    test('Socket Code Change should broadcast to other clients', (done) => {
        const roomId = 'sync-room';
        const client1 = new Client(`http://localhost:${port}`);
        let client2;

        client1.on('connect', () => {
            client1.emit('join', { roomId, userName: 'SyncUser1' });

            client2 = new Client(`http://localhost:${port}`);
            client2.on('connect', () => {
                client2.emit('join', { roomId, userName: 'SyncUser2' });

                client2.on('code_update', (code) => {
                    try {
                        expect(code).toBe('console.log("Sync Test")');
                        client1.close();
                        client2.close();
                        done();
                    } catch (err) {
                        client1.close();
                        client2.close();
                        done(err);
                    }
                });

                // Trigger update from Client 1
                setTimeout(() => {
                    client1.emit('code_change', { roomId, code: 'console.log("Sync Test")' });
                }, 100);
            });
        });
    }, 5000);
});
