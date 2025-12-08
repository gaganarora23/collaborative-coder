// { [roomId]: { code: string, language: string, users: Array<{id: string, name: string}> } }
const rooms = {};

const DEFAULT_CODE = '';
const DEFAULT_LANG = 'python';

const hasRoom = (roomId) => {
    return !!rooms[roomId];
};

const getRoom = (roomId) => {
    if (!rooms[roomId]) {
        rooms[roomId] = {
            code: DEFAULT_CODE,
            language: DEFAULT_LANG,
            lastOutput: null, // { result?, error? }
            users: []
        };
    }
    return rooms[roomId];
};

const addUser = (roomId, user) => {
    const room = getRoom(roomId);
    if (!room.users.find(u => u.id === user.id)) {
        room.users.push(user);
    }
    return room;
};

const removeUser = (socketId) => {
    let affectedRoomId = null;
    let affectedRoom = null;
    for (const roomId in rooms) {
        const room = rooms[roomId];
        const index = room.users.findIndex(u => u.id === socketId);
        if (index !== -1) {
            room.users.splice(index, 1);
            if (room.users.length === 0) {
                delete rooms[roomId];
            }
            affectedRoomId = roomId;
            affectedRoom = room;
            break;
        }
    }
    return affectedRoomId ? { roomId: affectedRoomId, room: affectedRoom } : null;
};

const updateCode = (roomId, code) => {
    const room = getRoom(roomId);
    room.code = code;
    return room;
};

const updateLanguage = (roomId, language) => {
    const room = getRoom(roomId);
    room.language = language;
    return room;
};

const updateOutput = (roomId, output) => {
    const room = getRoom(roomId);
    room.lastOutput = output;
    return room;
};

module.exports = {
    getRoom,
    hasRoom,
    addUser,
    removeUser,
    updateCode,
    updateLanguage,
    updateOutput
};
