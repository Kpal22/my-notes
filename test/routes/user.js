const path = require('path');
const fs = require('fs');

describe('Testing routes/user.js', () => {
    
    const app = require('../../src/app');
    const request = require('supertest')(app);

    const User = require('../../src/models/user');
    const name = 'valid user';
    const email = 'validuser@gmail.com';
    const password = 'P@ssw0rd';
    const VALID_USER = { name, email, password };

    beforeEach(async () => {
        await User.deleteMany({});
    });

    test('Should signup a valid user', async () => {
        const response = await request.post('/users/signup').send(VALID_USER).expect(201);
        const user = await User.findOne({ email });
        expect(response.body).toMatchObject({ token: user.tokens[0].token });
        expect(user.password).not.toBe(password);
    });

    test('Should not signup a user with invalid data', async () => {
        await request.post('/users/signup').send({ name, email }).expect(400);
        await request.post('/users/signup').send({ email, password }).expect(400);
        await request.post('/users/signup').send({ name, password }).expect(400);
        await request.post('/users/signup').send({ name: 12, email, password }).expect(400);
        await request.post('/users/signup').send({ name, email: 'invalid@mail', password }).expect(400);
        await request.post('/users/signup').send({ name, email, password: 'InvalidPass' }).expect(400);
    });

    test('Should not signup a user with existing email', async () => {
        await request.post('/users/signup').send(VALID_USER).expect(201);
        await request.post('/users/signup').send(VALID_USER).expect(409);
    });

    test('Should login a user with valid credential', async () => {
        await request.post('/users/signup').send(VALID_USER).expect(201);
        timeDelay();
        const response = await request.post('/users/login').send(VALID_USER).expect(200);
        const user = await User.findOne({ email });
        expect(response.body).toMatchObject({ token: user.tokens[1].token });
    });

    test('Should not login a user with invalid credential', async () => {
        await request.post('/users/signup').send(VALID_USER).expect(201);
        await request.post('/users/login').send({ email }).expect(401);
        await request.post('/users/login').send({ password }).expect(401);
        await request.post('/users/login').send({ email: 'invalid@mail', password }).expect(401);
        await request.post('/users/login').send({ email, password: 'InvalidPass' }).expect(401);
    });

    test('Should not login a user without signup', async () => {
        await request.post('/users/login').send(VALID_USER).expect(401);
    });

    test('Should logout a user with valid token', async () => {
        await request.post('/users/signup').send(VALID_USER).expect(201);
        let user = await User.findOne({ email });
        timeDelay();
        const response = await request.post('/users/login').send(VALID_USER).expect(200);
        user = await User.findOne({ email });
        expect(response.body).toMatchObject({ token: user.tokens[1].token });
        timeDelay();
        await request.post('/users/logout').set('Authorization', `Bearer ${response.body.token}`).send().expect(200);
        user = await User.findOne({ email });
        expect(response.body).not.toMatchObject({ token: user.tokens[0].token });
    });

    test('Should give error while logout with invalid token', async () => {
        await request.post('/users/signup').send(VALID_USER).expect(201);
        timeDelay();
        const response = await request.post('/users/login').send(VALID_USER).expect(200);
        await request.post('/users/logout').set('Authorization', `Bearer ${response.body.token}`).send().expect(200);
        await request.post('/users/logout').set('Authorization', `Bearer ${response.body.token}`).send().expect(401);
    });

    test('Should logoutAll a user with valid token', async () => {
        const response1 = await request.post('/users/signup').send(VALID_USER).expect(201);
        timeDelay();
        const response2 = await request.post('/users/login').send(VALID_USER).expect(200);
        timeDelay();
        const response3 = await request.post('/users/login').send(VALID_USER).expect(200);
        await request.post('/users/logout/all').set('Authorization', `Bearer ${response3.body.token}`).send().expect(200);
        await request.post('/users/logout/all').set('Authorization', `Bearer ${response2.body.token}`).send().expect(401);
        await request.post('/users/logout/all').set('Authorization', `Bearer ${response1.body.token}`).send().expect(401);
    });

    test('Should get user with valid token', async () => {
        const response = await request.post('/users/signup').send(VALID_USER).expect(201);
        const user = await request.get('/users').set('Authorization', `Bearer ${response.body.token}`).send().expect(200);
        expect(user.body).toEqual(expect.objectContaining({ name, email }));
    });

    test('Should not get user with invalid token', async () => {
        const response = await request.post('/users/signup').send(VALID_USER).expect(201);
        await request.post('/users/logout/all').set('Authorization', `Bearer ${response.body.token}`).send().expect(200);
        await request.get('/users').set('Authorization', `Bearer ${response.body.token}`).send().expect(401);
    });

    test('Should update user with valid token', async () => {
        const response = await request.post('/users/signup').send(VALID_USER).expect(201);
        let dbuser = await User.findOne({ email });
        expect(dbuser.name).toEqual(VALID_USER.name);
        let user = await request.patch('/users').set('Authorization', `Bearer ${response.body.token}`).send({ name: 'new user' }).expect(200);
        dbuser = await User.findOne({ email });
        expect(dbuser.name).toEqual(user.body.name);
        user = await request.patch('/users').set('Authorization', `Bearer ${response.body.token}`).send({ email: 'newuser@gmail.com' }).expect(200);
        dbuser = await User.findOne({ email: 'newuser@gmail.com' });
        expect(dbuser.email).toEqual(user.body.email);
    });

    test('Should not update user with invalid updates/token', async () => {
        const response = await request.post('/users/signup').send(VALID_USER).expect(201);
        await request.patch('/users').set('Authorization', `Bearer ${response.body.token}`).send().expect(400);
        await request.post('/users/logout').set('Authorization', `Bearer ${response.body.token}`).send().expect(200);
        await request.patch('/users').send({ name: 'new user' }).expect(401);
        await request.patch('/users').set('Authorization', `Bearer asd123asd123`).send({ name: 'new user' }).expect(401);
        await request.patch('/users').set('Authorization', `Bearer ${response.body.token}`).send({ name: 'new user' }).expect(401);
        await request.patch('/users').set('Authorization', `Bearer ${response.body.token}`).send({ email: 'newuser@gmail.com' }).expect(401);
    });

    test('Should update user password with valid credential', async () => {
        const response = await request.post('/users/signup').send(VALID_USER).expect(201);
        await request.put('/users').set('Authorization', `Bearer ${response.body.token}`).send({ oldPassword: password, newPassword: 'QWEasd123@!#' }).expect(200);
        await request.post('/users/login').send(VALID_USER).expect(401);
        await request.post('/users/login').send({ email, password: 'QWEasd123@!#' }).expect(200);
    });

    test('Should not update user password with invalid credential/token', async () => {
        const response = await request.post('/users/signup').send(VALID_USER).expect(201);
        await request.put('/users').set('Authorization', `Bearer ${response.body.token}`).send({ oldPassword: password, newPassword: password }).expect(400);
        await request.put('/users').set('Authorization', `Bearer ${response.body.token}`).send({ oldPassword: 'QWEasd123@!#', newPassword: 'QWEasd123@!#' }).expect(400);
        await request.put('/users').set('Authorization', `Bearer ${response.body.token}`).send({ oldPassword: password, newPassword: 'InvalidPassword' }).expect(400);
        await request.post('/users/logout').set('Authorization', `Bearer ${response.body.token}`).send().expect(200);
        await request.put('/users').set('Authorization', `Bearer ${response.body.token}`).send({ oldPassword: password, newPassword: 'QWEasd123@!#' }).expect(401);
    });

    test('Should delete user with valid token', async () => {
        const response = await request.post('/users/signup').send(VALID_USER).expect(201);
        await request.delete('/users').set('Authorization', `Bearer ${response.body.token}`).send().expect(200);
        const user = await User.findOne({ email });
        expect(user).toBeNull();
    });

    test('Should not delete user with invalid token', async () => {
        const response = await request.post('/users/signup').send(VALID_USER).expect(201);
        await request.post('/users/logout').set('Authorization', `Bearer ${response.body.token}`).send().expect(200);
        await request.delete('/users').set('Authorization', `Bearer ${response.body.token}`).send().expect(401);
        const user = await User.findOne({ email });
        expect(user).not.toBeNull();
    });

    test('Should upload user avatar', async () => {
        const response = await request.post('/users/signup').send(VALID_USER).expect(201);
        const path = require('path');
        await request.post('/users/avatar').set('Authorization', `Bearer ${response.body.token}`).attach('avatar', path.join(__dirname, '../fixtures/profile_avatar.jpg')).expect(200);
        const user = await User.find({ email });
        expect(user[0].avatar).toEqual(expect.any(Buffer));
    });

    test('Should not upload invalid avatar or using invalid token', async () => {
        const response = await request.post('/users/signup').send(VALID_USER).expect(201);
        let fileName = 'test_doc.docx';
        await request.post('/users/avatar').set('Authorization', `Bearer ${response.body.token}`).attach('avatar', getFile(fileName), fileName ).expect(400);
        fileName = 'test_pdf.pdf';
        await request.post('/users/avatar').set('Authorization', `Bearer ${response.body.token}`).attach('avatar', getFile(fileName), fileName ).expect(400);
        await request.post('/users/logout').set('Authorization', `Bearer ${response.body.token}`).send().expect(200);
        fileName = 'profile_avatar.jpg';
        await request.post('/users/avatar').set('Authorization', `Bearer ${response.body.token}`).attach('avatar', getFile(fileName), fileName ).expect(401);
    });

    test('Should get user avatar with valid token', async () => {
        const response = await request.post('/users/signup').send(VALID_USER).expect(201);
        await request.post('/users/avatar').set('Authorization', `Bearer ${response.body.token}`).attach('avatar', path.join(__dirname, '../fixtures/profile_avatar.jpg')).expect(200);
        const avatar = await request.get('/users/avatar').set('Authorization', `Bearer ${response.body.token}`).expect(200);
        expect(avatar.body).toEqual(expect.any(Buffer));
    });

    test('Should not get user avatar with invalid token', async () => {
        const response = await request.post('/users/signup').send(VALID_USER).expect(201);
        await request.post('/users/avatar').set('Authorization', `Bearer ${response.body.token}`).attach('avatar', path.join(__dirname, '../fixtures/profile_avatar.jpg')).expect(200);
        await request.get('/users/avatar').set('Authorization', `Bearer ${response.body.token}`).expect(200);
        await request.post('/users/logout').set('Authorization', `Bearer ${response.body.token}`).send().expect(200);
        await request.get('/users/avatar').set('Authorization', `Bearer ${response.body.token}`).expect(401);
    });

});

const timeDelay = () => {
    for (let i = 0; i < 10000000; i++) {
        for (let j = 0; j < 235; j++);
    }
}

const getFile = fileName => fs.readFileSync( path.join(__dirname, '../fixtures/' + fileName));