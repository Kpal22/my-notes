describe('Testing src/app.js', () => {

    const app = require('../src/app');
    const request = require('supertest')(app);

    test('Should redirect swagger', async () => await request.get('/').send().expect(302));
});