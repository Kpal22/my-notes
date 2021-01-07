describe('Testing utils/note.js for error', () => {

    const noteUtil = require('../../../src/utils/note');
    const title = 'Note 1';
    const content = 'Loerum Ipsum';
    const VALID_NOTE = { title, content }

    test('Note Util should get Server Error 500', async () => {
        await expect(require('../../../src/db/mongoose')).rejects.toEqual(expect.any(Error));
        await expect(noteUtil.save(VALID_NOTE, 'ASD123qwe!@#')).rejects.toEqual(expect.objectContaining({ 'status': 500 }));
    });

});