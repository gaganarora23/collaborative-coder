import React from 'react';

const Output = ({ result, error, loading }) => {
    return (
        <div className="output-window">
            <h3 style={{ marginTop: 0, fontSize: '14px', color: '#ccc' }}>Output</h3>
            {loading && <div style={{ color: '#888' }}>Running...</div>}
            {error && <pre style={{ color: '#f48771', whiteSpace: 'pre-wrap' }}>{error}</pre>}
            {result && (
                <pre style={{ color: '#d4d4d4', whiteSpace: 'pre-wrap' }}>
                    {result.run ? result.run.output : result.message}
                </pre>
            )}
            {!loading && !error && !result && <div style={{ color: '#666', fontStyle: 'italic' }}>Run code to see results...</div>}
        </div>
    );
};

export default Output;
