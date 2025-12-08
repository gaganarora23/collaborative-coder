# Collaborative Coding Platform

A real-time collaborative coding interview platform supporting multiple languages and secure execution.

## Features
- **Real-time Collaboration**: Multi-user editing with instant sync.
- **Code Execution**: Run C, C++, Python, Java, Go, Javascript safely in the browser.
- **Identity**: User presence list.
- **Language Support**: Syntax highlighting for all supported languages.

## Architecture
- **Frontend**: React, Vite, Monaco Editor, Socket.io-client.
- **Backend**: Node.js, Express, Socket.io.
- **Execution**: Piston API.

## Prerequisites
- Node.js (v16+)
- npm

## Setup & Run

1.  **Install Dependencies**:
    ```bash
    # Server
    cd server
    npm install
    
    # Client
    cd client
    npm install
    ```

2.  **Start the Application**:
    ```bash
    # Server (Port 3001)
    cd server
    npm start

    # Client (Port 5173)
    cd client
    npm run dev -- --host
    ```

3.  **Access**: Open `http://localhost:5173`.

## Testing
The project includes Unit and Integration tests.

```bash
# Run Server Tests
cd server
npm test

# Run Client Tests
cd client
npx vitest run
```

## Usage
1.  Enter your name when prompted.
2.  Share the URL (with `?room=...`) to invite others.
3.  Collaborate on code.
4.  Select language and click Run to execute code.
