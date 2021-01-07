describe('Testing routes/user.js for Error', () => {

    const app = require('../../../src/app');
    const request = require('supertest')(app);

    const auth = require('../../../src/configs/auth');

    const name = 'valid user';
    const email = 'validuser@gmail.com';
    const password = 'P@ssw0rd';
    const VALID_USER = { name, email, password };

    test('Signup should get Server Error 500', async () =>
        await request.post('/users/signup').send(VALID_USER).expect(500));

    test('Logout should get Server Error 500', async () =>
        await request.post('/users/logout').set('Authorization', `Bearer ${auth.genToken({ _id: '507f1f77bcf86cd799439011' })}`).send().expect(500));

});