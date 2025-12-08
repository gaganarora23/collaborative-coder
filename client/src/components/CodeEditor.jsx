import React, { useRef, useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ code, language, onChange, socket, roomId, currentUser }) => {
    const [value, setValue] = useState(code);
    const editorRef = useRef(null);
    const monacoRef = useRef(null);
    const decorationsRef = useRef({}); // Store decoration IDs per user

    // Colors for different users to make them distinct
    const CURSOR_COLORS = ['#ff0000', '#00ff00', '#0000ff', '#ffa500', '#800080', '#008080'];
    const getUserColor = (id) => {
        let hash = 0;
        for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
        const index = Math.abs(hash) % CURSOR_COLORS.length;
        return CURSOR_COLORS[index];
    };

    useEffect(() => {
        setValue(code);
    }, [code]);

    // Handle remote cursor updates
    useEffect(() => {
        if (!socket || !editorRef.current || !monacoRef.current) return;

        const handleCursorUpdate = ({ id, userName, position }) => {
            if (id === socket.id) return; // Ignore self

            const color = getUserColor(id);
            const cursorClass = `remote-cursor-${id}`;
            const labelClass = `remote-label-${id}`;

            // Dynamic CSS for user color if not exists
            if (!document.getElementById(`style-${id}`)) {
                const style = document.createElement('style');
                style.id = `style-${id}`;
                style.innerHTML = `
                    .${cursorClass} { border-left: 2px solid ${color}; height: 20px; box-sizing: border-box; }
                    .${labelClass}:after { content: "${userName}"; background: ${color}; color: black; padding: 2px 4px; font-size: 10px; border-radius: 4px; position: absolute; bottom: 100%; left: 0; white-space: nowrap; pointer-events: none; }
                `;
                document.head.appendChild(style);
            }

            // Create decorations
            // We use two decorations: one for cursor line, one for label widget (sticking to cursor)
            // Actually, typical Monaco way is one decoration with className and a ContentWidget, OR
            // a decoration with afterContentClassName if we use CSS content trick.
            // Let's use the className + CSS content trick for simplicity.

            const newDecorations = [
                {
                    range: new monacoRef.current.Range(position.lineNumber, position.column, position.lineNumber, position.column),
                    options: {
                        className: cursorClass,
                        stickiness: monacoRef.current.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
                    }
                },
                {
                    range: new monacoRef.current.Range(position.lineNumber, position.column, position.lineNumber, position.column),
                    options: {
                        afterContentClassName: labelClass,
                        stickiness: monacoRef.current.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
                    }
                }
            ];

            const oldIds = decorationsRef.current[id] || [];
            decorationsRef.current[id] = editorRef.current.deltaDecorations(oldIds, newDecorations);
        };

        socket.on('cursor_update', handleCursorUpdate);

        return () => {
            socket.off('cursor_update', handleCursorUpdate);
        };
    }, [socket, roomId]);

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;

        editor.onDidChangeCursorPosition((e) => {
            if (socket) {
                socket.emit('cursor_move', {
                    roomId,
                    position: e.position,
                    userName: currentUser?.name || 'Guest'
                });
            }
        });
    };

    const handleEditorChange = (newValue) => {
        setValue(newValue);
        onChange(newValue);
    };

    return (
        <div style={{ height: '100%', width: '100%' }}>
            <Editor
                height="100%"
                theme="vs-dark"
                language={language}
                value={value}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    automaticLayout: true,
                }}
            />
        </div>
    );
};

export default CodeEditor;
