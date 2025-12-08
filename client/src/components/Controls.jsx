import React from 'react';

const LANGUAGES = [
    { id: 'javascript', name: 'JavaScript', version: '18.15.0' },
    { id: 'python', name: 'Python', version: '3.10.0' },
    { id: 'java', name: 'Java', version: '15.0.2' },
    { id: 'c', name: 'C', version: '10.2.0' },
    { id: 'cpp', name: 'C++', version: '10.2.0' },
    { id: 'go', name: 'Go', version: '1.16.2' }
];

const Controls = ({ language, onLanguageChange, onRun, loading }) => {
    return (
        <div className="controls">
            <select
                value={language}
                onChange={(e) => onLanguageChange(e.target.value)}
                disabled={loading}
            >
                {LANGUAGES.map(lang => (
                    <option key={lang.id} value={lang.id}>{lang.name}</option>
                ))}
            </select>
            <button onClick={onRun} disabled={loading}>
                {loading ? 'Running...' : 'Run Code'}
            </button>
        </div>
    );
};

export default Controls;
export { LANGUAGES };
