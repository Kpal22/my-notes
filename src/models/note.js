const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'is required'],
        minlength: [3, 'requires minimum 3 characters'],
        trim: true
    },
    content: {
        type: String,
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
});

noteSchema.methods.toJSON = function () {
    const note = this;
    const noteJson = note.toObject();
    noteJson.id = noteJson._id;
    delete noteJson._id;
    delete noteJson.owner;
    delete noteJson.__v;
    return noteJson;
}

/**
 * @swagger
 * components:
 *  schemas:
 *      Note:
 *          required:
 *              - title
 *          properties:
 *              title:
 *                  type: string
 *                  description: Title of the Note
 *              content:
 *                  type: string
 *                  description: Content of the Note
 */
module.exports = mongoose.model('Note', noteSchema);