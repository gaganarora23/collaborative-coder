import React from 'react';

const UserList = ({ users, currentUser }) => {
    return (
        <div className="user-list">
            <h3 style={{ marginTop: 0, fontSize: '14px', color: '#ccc' }}>Active Users ({users.length})</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {users.map(u => (
                    <li key={u.id} style={{ padding: '5px 0', fontSize: '13px', display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#4caf50', marginRight: 8 }}></div>
                        {u.name} {u.id === currentUser?.id ? '(You)' : ''}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserList;
