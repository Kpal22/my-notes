const Note = require('../models/note');
const logger = require('../logger');

const getError = error => {
    const errorMsg = error.message.toLowerCase();
    if (errorMsg.includes('validation failed')) {
        error = { status: 400, message: error.message.split('validation failed:')[1].replace(/:/g, '') };
    } else if (errorMsg.includes('invalid updates') || errorMsg.includes('invalid input')) {
        error = { status: 400, message: error.message };
    } else if (errorMsg.includes('data not found')) {
        error = { status: 404, message: error.message };
    } else {
        logger.errorObj(error);
        error = { status: 500, message: 'Server Error!' };
    }
    return error;
}

const save = async ({ title, content = '' } = {}, owner) => {
    try {
        const note = await new Note({ title, content, owner }).save();
        return note;
    } catch (err) {
        throw getError(err);
    }
}

const update = async (_id, { title, content } = {}, owner) => {
    try {
        if (_id && (title || content)) {
            const note = await Note.findOne({ _id, owner });
            if (note) {
                if (title && title != note.title) {
                    note.title = title;
                }
                if (content && content != note.content) {
                    note.content = content;
                }
                return await note.save();
            } else {
                throw new Error('Data Not Found!');
            }
        } else {
            throw new Error('Invalid Updates!');
        }
    } catch (err) {
        throw getError(err);
    }
}

const remove = async (_id, owner) => {
    try {
        if (_id) {
            const note = await Note.findOneAndDelete({ _id, owner });
            if (note) {
                return note;
            } else {
                throw new Error('Data Not Found!');
            }
        } else {
            throw new Error('Invalid Input!');
        }
    } catch (err) {
        throw getError(err);
    }
}


module.exports = { save, update, remove };