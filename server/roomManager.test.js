const { addUser, removeUser, updateCode, updateLanguage, getRoom } = require('./roomManager');

describe('Room Manager', () => {
    const roomId = 'test-room';

    test('should add user to room', () => {
        const user = { id: 'socket1', name: 'Alice' };
        const room = addUser(roomId, user);
        expect(room.users).toHaveLength(1);
        expect(room.users[0]).toEqual(user);
    });

    test('should not add duplicate user by id', () => {
        const user = { id: 'socket1', name: 'Alice' };
        addUser(roomId, user);
        const room = addUser(roomId, user);
        expect(room.users).toHaveLength(1);
    });

    test('should update code', () => {
        const newCode = 'print("hello")';
        const room = updateCode(roomId, newCode);
        expect(room.code).toBe(newCode);
    });

    test('should update language', () => {
        const lang = 'python';
        const room = updateLanguage(roomId, lang);
        expect(room.language).toBe(lang);
    });

    test('should remove user', () => {
        const result = removeUser('socket1');
        expect(result).not.toBeNull();
        expect(result.roomId).toBe(roomId);
        expect(result.room.users).toHaveLength(0);
    });
});
