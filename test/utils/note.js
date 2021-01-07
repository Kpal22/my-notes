describe('Testing utils/note.js', () => {

    const User = require('../../src/models/user');
    const name = 'valid user';
    const email = 'validuser@gmail.com';
    const password = 'P@ssw0rd';
    const VALID_USER = { name, email, password };

    const Note = require('../../src/models/note');
    const noteUtil = require('../../src/utils/note');
    const title = 'Note 1';
    const content = 'Loerum Ipsum';
    const VALID_NOTE = { title, content }

    beforeEach(async () => {
        await User.deleteMany({});
        await Note.deleteMany({});
    });

    test('Note Util should save a valid note', async () => {
        const user = await new User(VALID_USER).save();
        await expect(noteUtil.save(VALID_NOTE, user._id)).resolves.toEqual(expect.objectContaining(VALID_NOTE));
    });

    test('Note Util should not save a note with invalid title', async () => {
        const user = await new User(VALID_USER).save();
        await expect(noteUtil.save({ title: 12, content }, user._id)).rejects.toEqual(expect.objectContaining({ 'status': 400 }));
    });

    test('Note Util should update a valid note', async () => {
        const user = await new User(VALID_USER).save();
        const note = await noteUtil.save(VALID_NOTE, user._id);
        const updatedNote = {
            title: 'Note 12',
            content: 'Loerum Ipsum 12'
        }
        await expect(noteUtil.update(note._id, updatedNote, user._id)).resolves.toEqual(expect.objectContaining(updatedNote));
    });

    test('Note Util should not update a note with invalid updates', async () => {
        const user = await new User(VALID_USER).save();
        const note = await noteUtil.save(VALID_NOTE, user._id);
        await expect(noteUtil.update(note._id, {title: 12}, user._id)).rejects.toEqual(expect.objectContaining({ 'status': 400 }));
        await expect(noteUtil.update(note._id, {}, user._id)).rejects.toEqual(expect.objectContaining({ 'status': 400 }));
        await expect(noteUtil.update(undefined, {}, user._id)).rejects.toEqual(expect.objectContaining({ 'status': 400 }));
        await expect(noteUtil.update(note._id, {title: 12}, undefined)).rejects.toEqual(expect.objectContaining({ 'status': 404 }));
    });

    test('Note Util should remove a note with valid id & owner', async () => {
        const user = await new User(VALID_USER).save();
        const note = await noteUtil.save(VALID_NOTE, user._id);
        await expect(Note.findById(note._id)).resolves.not.toBeNull();
        await expect(noteUtil.remove(note._id, user._id)).resolves.toEqual(expect.objectContaining(VALID_NOTE));
        await expect(Note.findById(note._id)).resolves.toBeNull();
    });

    test('Note Util should give error while removing a note with invalid id & owner', async () => {
        const user = await new User(VALID_USER).save();
        const note = await noteUtil.save(VALID_NOTE, user._id);
        await expect(noteUtil.remove(undefined, user._id)).rejects.toEqual(expect.objectContaining({ 'status': 400 }));
        await expect(noteUtil.remove(note._id, undefined)).rejects.toEqual(expect.objectContaining({ 'status': 404 }));
        await expect(Note.findById(note._id)).resolves.not.toBeNull();
    });

    afterAll(async () => {
        await User.deleteMany({});
        await Note.deleteMany({});
    });
});