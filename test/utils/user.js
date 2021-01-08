describe('Testing utils/user.js', () => {

    const User = require('../../src/models/user');
    const userUtil = require('../../src/utils/user');
    const name = 'valid user';
    const email = 'validuser@gmail.com';
    const password = 'P@ssw0rd';
    const VALID_USER = { name, email, password };

    beforeEach(async () => await User.deleteMany({}));

    test('User Util should save a valid user', async () => await expect(userUtil.save(VALID_USER)).resolves.toHaveProperty('token'));

    test('User Util should not save any invalid user', async () => {
        await expect(userUtil.save()).rejects.toEqual(expect.objectContaining({ 'status': 400 }));
        await expect(userUtil.save({ email, password })).rejects.toEqual(expect.objectContaining({ 'status': 400 }));
        await expect(userUtil.save({ name: 'ka', email, password })).rejects.toEqual(expect.objectContaining({ 'status': 400 }));
        await expect(userUtil.save({ name, password })).rejects.toEqual(expect.objectContaining({ 'status': 400 }));
        await expect(userUtil.save({ name, email: 'invalid@gmail', password })).rejects.toEqual(expect.objectContaining({ 'status': 400 }));
        await userUtil.save(VALID_USER);
        await expect(userUtil.save(VALID_USER)).rejects.toEqual(expect.objectContaining({ 'status': 409 }));
        await expect(userUtil.save({ name, email })).rejects.toEqual(expect.objectContaining({ 'status': 400 }));
        await expect(userUtil.save({ name, email, password: 'Invalid Password' })).rejects.toEqual(expect.objectContaining({ 'status': 400 }));
    });

    test('User Util should login for valid credential', async () => {
        await userUtil.save(VALID_USER);
        await expect(userUtil.login(VALID_USER)).resolves.toHaveProperty('token');
    });

    test('User Util should not login for invalid credential', async () => {
        await userUtil.save(VALID_USER);
        await expect(userUtil.login()).rejects.toEqual(expect.objectContaining({ 'status': 401 }));
        await expect(userUtil.login({ email: 'invalid@gmail.com', password })).rejects.toEqual(expect.objectContaining({ 'status': 401 }));
        await expect(userUtil.login({ email, password: 'Invalid Password' })).rejects.toEqual(expect.objectContaining({ 'status': 401 }));
    });

});