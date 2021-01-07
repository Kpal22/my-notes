describe('Testing db/mongoose.js for Error', () => {

    test('Should get error while connecting to MongoDB with invalid URL', async () =>
        await expect(require('../../../src/db/mongoose')).rejects.toEqual(expect.any(Error)));
        
});