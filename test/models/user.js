describe('Testing models/user.js', () => {

    const User = require('../../src/models/user');
    const name = 'valid user';
    const email = 'validuser@gmail.com';
    const password = 'P@ssw0rd';
    const VALID_USER = { name, email, password };

    beforeEach(async () => await User.deleteMany({}));

    test('User Model should save a valid user', async () => {
        await new User(VALID_USER).save();
        await expect(User.findOne({ name, email })).resolves.toEqual(expect.objectContaining({ name, email }));
    });

    test('User Model should not disclose sensitive data of a saved user', async () => {
        const user = await new User(VALID_USER).save();
        expect(user.toJSON()).not.toHaveProperty('_id');
        expect(user.toJSON()).not.toHaveProperty('password');
        expect(user.toJSON()).not.toHaveProperty('tokens');
        expect(user.toJSON()).not.toHaveProperty('avatar');
        expect(user.toJSON()).not.toHaveProperty('__v');
    });

    test('User Model should not save an user without name', async () => {
        await expect(new User({ email, password }).save()).rejects.toEqual(expect.any(Error));
    });

    test('User Model should not save an user with invalid name', async () => {
        await expect(new User({ name: 'us', email, password }).save()).rejects.toEqual(expect.any(Error));
    });

    test('User Model should not save an user without an email', async () => {
        await expect(new User({ name, password }).save()).rejects.toEqual(expect.any(Error));
    });

    test('User Model should not save an user with invalid email', async () => {
        await expect(new User({ name, email: 'invalid@gmail', password }).save()).rejects.toEqual(expect.any(Error));
    });

    test('User Model should not save an user with an existing email', async () => {
        await new User(VALID_USER).save();
        await expect(new User(VALID_USER).save()).rejects.toEqual(expect.any(Error));
    });

    test('User Model should not save an user without a password', async () => {
        await expect(new User({ name, email }).save()).rejects.toEqual(expect.any(Error));
    });

    test('User Model should not save an user with invalid password', async () => {
        await expect(new User({ name, email, password: 'Invalid Password' }).save()).rejects.toEqual(expect.any(Error));
    });

    test('User Model should find valid user with valid credential', async () => {
        await new User(VALID_USER).save();
        await expect(User.findByCredentials({ email, password })).resolves.toEqual(expect.objectContaining({ name, email }));
    });

    test('User Model should give error for invalid credential', async () => {
        await new User(VALID_USER).save();
        await expect(User.findByCredentials({ email, password: 'Invalid Password' })).rejects.toEqual(expect.any(Error));
    });

    test('User Model should update name of valid user', async () => {
        const user = await new User(VALID_USER).save();
        const newName = 'new user';
        const updatedUser = await user.updateUser({ name: newName });
        expect(updatedUser).toHaveProperty('name', newName);
        expect(updatedUser).toHaveProperty('email', email);
    });

    test('User Model should update email of valid user', async () => {
        const user = await new User(VALID_USER).save();
        const newEmail = 'newuser@gmail.com';
        const updatedUser = await user.updateUser({ email: newEmail });
        expect(updatedUser).toHaveProperty('name', name);
        expect(updatedUser).toHaveProperty('email', newEmail);
    });

    test('User Model should give error for invalid updates', async () => {
        const user = await new User(VALID_USER).save();
        await expect(user.updateUser()).rejects.toEqual(expect.objectContaining({ 'status': 400 }));
        await expect(user.updateUser({ name: '  ' })).rejects.toEqual(expect.objectContaining({ 'status': 400 }));
        await expect(user.updateUser({ email: 'invalid@gmail' })).rejects.toEqual(expect.objectContaining({ 'status': 400 }));
    });

    test('User Model should give error for updating email if that already exists', async () => {
        await new User({ name, email: 'newuser@gmail.com', password }).save();
        const user = await new User(VALID_USER).save();
        await expect(user.updateUser({ email: 'newuser@gmail.com' })).rejects.toEqual(expect.objectContaining({ 'status': 409 }));
    });

    test('User Model should update password of user with new valid password', async () => {
        const user = await new User(VALID_USER).save();
        const newPassword = 'QWE123asd!@#';
        await user.updatePassword({ oldPassword: password, newPassword });
        await expect(User.findByCredentials(VALID_USER)).rejects.toEqual(expect.any(Error));
        await expect(User.findByCredentials({ name, password: newPassword, email })).resolves.toEqual(expect.objectContaining({ name, email }));
    });

    test('User Model should give error while updating password of user with invalid passwords', async () => {
        const user = await new User(VALID_USER).save();
        const oldPassword = password;
        const newPassword = password;
        await expect(user.updatePassword()).rejects.toEqual(expect.objectContaining({ 'status': 400 }));
        await expect(user.updatePassword({ oldPassword })).rejects.toEqual(expect.objectContaining({ 'status': 400 }));
        await expect(user.updatePassword({ newPassword })).rejects.toEqual(expect.objectContaining({ 'status': 400 }));
        await expect(user.updatePassword({ oldPassword, newPassword })).rejects.toEqual(expect.objectContaining({ 'status': 400 }));
        await expect(user.updatePassword({ oldPassword: 'Invalid Password', newPassword })).rejects.toEqual(expect.objectContaining({ 'status': 400 }));
    });

    test('User Model should set avatar for valid user', async () => {
        const fs = require('fs');
        const path = require('path');
        const buffer = fs.readFileSync(path.join(__dirname, '../fixtures/profile_avatar.jpg'));
        const user = await new User(VALID_USER).save();
        await user.setAvatar({ buffer });
        const found = await User.findByCredentials(VALID_USER);
        expect(found.avatar.toString()).toBe(user.avatar.toString());
    });

    test('User Model should give error while setting invalid avatar for user', async () => {
        const user = await new User(VALID_USER).save();
        await expect(user.setAvatar()).rejects.toEqual(expect.objectContaining({ 'status': 400 }));
    });

    test('User Model should not find valid user after user removed', async () => {
        const user = await new User(VALID_USER).save();
        await expect(User.findByCredentials(VALID_USER)).resolves.toEqual(expect.objectContaining({ name, email }));
        await user.remove();
        await expect(User.findByCredentials(VALID_USER)).rejects.toEqual(expect.any(Error));
    });

    afterAll(async () => await User.deleteMany({}));

});