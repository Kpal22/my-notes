describe('Testing models/note.js', () => {

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

    test('Note Model should save a valid note', async () => {
        const user = await new User(VALID_USER).save();
        const note = await new Note({ ...VALID_NOTE, owner: user._id }).save();
        const notes = await user.getNotes();
        expect(notes[0].toJSON()).toEqual(note.toJSON());
    });

    test('Note Model should not disclose sensitive data of a saved note', async () => {
        const user = await new User(VALID_USER).save();
        const note = await new Note({ ...VALID_NOTE, owner: user._id }).save();
        expect(note.toJSON()).not.toHaveProperty('_id');
        expect(note.toJSON()).not.toHaveProperty('owner');
        expect(note.toJSON()).not.toHaveProperty('__v');
    });

    test('Note Model should save a note with invalid title', async () => {
        const user = await new User(VALID_USER).save();
        await expect(new Note({ title: 12, content, owner: user._id }).save()).rejects.toEqual(expect.any(Error));
    });

    test('User Model should find saved note', async () => {
        const user = await new User(VALID_USER).save();
        const note = await new Note({ ...VALID_NOTE, owner: user._id }).save();
        const notes = await user.getNotes({ id: note.id });
        expect(notes[0].toJSON()).toEqual(note.toJSON());
        expect(notes[0]).toHaveProperty('createdAt');
        expect(notes[0]).toHaveProperty('updatedAt');
    });

    test('User Model should give error while fetching notes when no notes are saved', async () => {
        const user = await new User(VALID_USER).save();
        await expect(user.getNotes()).rejects.toEqual(expect.objectContaining({ 'status': 404 }));
    });

    test('Note Model should not find any note after user is removed', async () => {
        const user = await new User(VALID_USER).save();
        const note = await new Note({ ...VALID_NOTE, owner: user._id }).save();
        await expect(Note.findById(note._id)).resolves.not.toBeNull();
        await user.remove();
        await expect(Note.findById(note._id)).resolves.toBeNull();
    });

    afterAll(async () => {
        await User.deleteMany({});
        await Note.deleteMany({});
    });
});