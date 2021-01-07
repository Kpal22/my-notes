describe('Testing routes/note.js', () => {

    const app = require('../../src/app');
    const request = require('supertest')(app);

    const User = require('../../src/models/user');
    const name = 'valid user';
    const email = 'validuser@gmail.com';
    const password = 'P@ssw0rd';
    const VALID_USER = { name, email, password };

    const Note = require('../../src/models/note');
    const title = 'Note 1';
    const content = 'Loerum Ipsum';
    const VALID_NOTE = { title, content }

    beforeEach(async () => {
        await User.deleteMany({});
        await Note.deleteMany({});
    });

    test('Should save a valid note', async () => {
        const response = await request.post('/users/signup').send(VALID_USER).expect(201);
        const note = await request.post('/notes').set('Authorization', `Bearer ${response.body.token}`).send(VALID_NOTE).expect(201);
        expect(note.body).toEqual(expect.objectContaining(VALID_NOTE));
    });

    test('Should not save an invalid note with invalid token', async () => {
        const response = await request.post('/users/signup').send(VALID_USER).expect(201);
        await request.post('/notes').set('Authorization', `Bearer ${response.body.token}`).send().expect(400);
        await request.post('/notes').set('Authorization', `Bearer ${response.body.token}`).send({ content }).expect(400);
        await request.post('/notes').set('Authorization', `Bearer ${response.body.token}`).send({ title: 12, content }).expect(400);
        await request.post('/users/logout').set('Authorization', `Bearer ${response.body.token}`).send().expect(200);
        await request.post('/notes').set('Authorization', `Bearer ${response.body.token}`).send(VALID_NOTE).expect(401);
    });

    test('Should get a valid note', async () => {
        const response = await request.post('/users/signup').send(VALID_USER).expect(201);
        const note = await request.post('/notes').set('Authorization', `Bearer ${response.body.token}`).send(VALID_NOTE).expect(201);
        const fetched = await request.get('/notes').query(note.body).set('Authorization', `Bearer ${response.body.token}`).send().expect(200);
        expect(note.body).toEqual(fetched.body[0]);
    });

    test('Should not get any note without valid token', async () => {
        const response = await request.post('/users/signup').send(VALID_USER).expect(201);
        const note = await request.post('/notes').set('Authorization', `Bearer ${response.body.token}`).send(VALID_NOTE).expect(201);
        await request.get('/notes').set('Authorization', `Bearer ${response.body.token}`).send().expect(200);
        await Note.findByIdAndDelete(note.body.id);
        await request.get('/notes').set('Authorization', `Bearer ${response.body.token}`).send().expect(404);
        await request.post('/users/logout').set('Authorization', `Bearer ${response.body.token}`).send().expect(200);
        await request.get('/notes').set('Authorization', `Bearer ${response.body.token}`).send().expect(401);
    });

    test('Should update a valid note', async () => {
        const response = await request.post('/users/signup').send(VALID_USER).expect(201);
        const note = await request.post('/notes').set('Authorization', `Bearer ${response.body.token}`).send(VALID_NOTE).expect(201);
        let updated = await request.patch('/notes/' + note.body.id).set('Authorization', `Bearer ${response.body.token}`).send({title: 'New Note'}).expect(200);
        expect(note.body.title).not.toEqual(updated.body.title);
        expect(note.body.content).toEqual(updated.body.content);
        updated = await request.patch('/notes/' + note.body.id).set('Authorization', `Bearer ${response.body.token}`).send({content: 'New Content'}).expect(200);
        expect(note.body.title).not.toEqual(updated.body.title);
        expect(note.body.content).not.toEqual(updated.body.content);
    });

    test('Should not update a note with invalid updates/token', async () => {
        const response = await request.post('/users/signup').send(VALID_USER).expect(201);
        const note = await request.post('/notes').set('Authorization', `Bearer ${response.body.token}`).send(VALID_NOTE).expect(201);
        await request.patch('/notes/' + note.body.id).set('Authorization', `Bearer ${response.body.token}`).send().expect(400);
        await request.post('/users/logout').set('Authorization', `Bearer ${response.body.token}`).send().expect(200);
        await request.patch('/notes/' + note.body.id).set('Authorization', `Bearer ${response.body.token}`).send({title: 'New Note'}).expect(401);
    });

    test('Should delete a note', async () => {
        const response = await request.post('/users/signup').send(VALID_USER).expect(201);
        const note = await request.post('/notes').set('Authorization', `Bearer ${response.body.token}`).send(VALID_NOTE).expect(201);
        await request.delete('/notes/' + note.body.id).set('Authorization', `Bearer ${response.body.token}`).send().expect(200);
        await request.get('/notes').query(note.body).set('Authorization', `Bearer ${response.body.token}`).send().expect(404);
    });

    test('Should note delete a note with invalid token', async () => {
        const response = await request.post('/users/signup').send(VALID_USER).expect(201);
        let note = await request.post('/notes').set('Authorization', `Bearer ${response.body.token}`).send(VALID_NOTE).expect(201);
        await request.delete('/notes/' + note.body.id).set('Authorization', `Bearer ${response.body.token}`).send().expect(200);
        await request.delete('/notes/' + note.body.id).set('Authorization', `Bearer ${response.body.token}`).send().expect(404);
        note = await request.post('/notes').set('Authorization', `Bearer ${response.body.token}`).send(VALID_NOTE).expect(201);
        await request.post('/users/logout').set('Authorization', `Bearer ${response.body.token}`).send().expect(200);
        await request.delete('/notes/' + note.body.id).set('Authorization', `Bearer ${response.body.token}`).send().expect(401);
    });

    afterAll(async () => {
        await User.deleteMany({});
        await Note.deleteMany({});
    });
});