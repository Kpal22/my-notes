const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const sharp = require('sharp');
const Note = require('./note');

const passwordRegx = /^(?=.*?[0-9])(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[#?!@$%^&*\-_]).{8,}$/;

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'is required'],
        minlength: [3, 'requires minimum 3 characters'],
        trim: true
    },
    email: {
        type: String,
        unique: [true, 'already exists'],
        required: [true, 'is required'],
        trim: true,
        lowercase: true,
        validate: value => {
            if (!validator.isEmail(value)) {
                throw new Error('is invalid');
            }
        }
    },
    password: {
        type: String,
        required: [true, 'is required'],
        minlength: [8, 'requires minimum 8 characters'],
        trim: true,
        validate: value => {
            if (!passwordRegx.test(value)) {
                throw new Error('requires at least 1 capital, 1 small, 1 number, and 1 special character');
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        },
        expiresAt: {
            type: Date,
            required: true,
            default: () => new Date(Date.now() + (60 * 60 * 1000))
        }
    }],
    avatar: {
        type: Buffer
    }
},
    {
        timestamps: true
    }
);

const getError = error => {
    const errorMsg = error.message.toLowerCase();
    if (errorMsg.includes('validation failed')) {
        error = { status: 400, message: error.message.split('User validation failed:')[1].replace(/:/g, '') };
    } else if (errorMsg.includes('no data found')) {
        error = { status: 404, message: 'No Data Found!' };
    } else if (errorMsg.includes('duplicate key')) {
        error = { status: 409, message: 'Email Already Exists!' };
    } else {
        error = { status: 400, message: 'Invalid Updates!' };
    }
    return error;
}

userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();
    delete userObject._id;
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;
    delete userObject.__v;
    return userObject;
}

userSchema.methods.removeAuthToken = function (logoutToken) {
    const user = this;
    if (logoutToken) {
        user.tokens = user.tokens.filter(token => token.token !== logoutToken);
    } else {
        user.tokens = [];
    }
    user.save();
}

userSchema.methods.updateUser = async function ({ name, email } = {}) {
    try {
        if (!name && !email) {
            throw new Error('invalid updates');
        } else {
            const user = this;
            if (name && name !== user.name) {
                user.name = name;
            }
            if (email && email.toLowerCase !== user.email) {
                user.email = email;
            }
            await user.save();
            return user;
        }
    } catch (err) {
        throw getError(err);
    }
}

userSchema.methods.updatePassword = async function ({ oldPassword, newPassword } = {}) {
    try {
        const user = this;
        if (oldPassword && newPassword && oldPassword != newPassword && await bcrypt.compare(oldPassword, user.password)) {
            user.password = newPassword;
            user.tokens = [];
            await user.save();
            return;
        } else {
            throw new Error('invalid updates');
        }
    } catch (err) {
        throw getError(err);
    }
}

userSchema.methods.setAvatar = async function ({ buffer } = {}) {
    try {

        if (buffer) {
            const user = this;
            user.avatar = await sharp(buffer).resize({ width: 250, height: 250 }).png().toBuffer();
            await user.save();
            return;
        } else {
            throw new Error('invalid updates');
        }
    } catch (err) {
        throw getError(err);
    }
}

userSchema.statics.findByCredentials = async function ({ email, password } = {}) {
    const user = await this.findOne({ email });
    if (user && password && await bcrypt.compare(password, user.password)) {
        return user;
    } else {
        throw new Error('Login Failed!');
    }
}

userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 10);
    }
    next();
});

userSchema.pre('remove', async function (next) {
    const user = this;
    await Note.deleteMany({ owner: user._id });
    next();
});

userSchema.virtual('notes', {
    ref: 'Note',
    localField: '_id',
    foreignField: 'owner'
});


userSchema.methods.getNotes = async function ({ id, limit, skip, sortBy, order } = {}) {
    try {
        const user = this;
        const popOptions = { path: 'notes' };
        if (id) {
            popOptions.match = { _id: id };
        } else {
            popOptions.options = {
                limit: parseInt(limit),
                skip: parseInt(skip),
                sort: { [sortBy]: order === 'desc' ? -1 : 1 }
            };
        }
        await user.populate(popOptions).execPopulate();
        if (user.notes.length > 0) {
            return user.notes;
        } else {
            throw new Error('no data found');
        }
    } catch (err) {
        throw getError(err);
    }
}


/**
 * @swagger
 * components:
 *  schemas:
 *      User:
 *          required:
 *              - name
 *              - email
 *              - password
 *          properties:
 *              name:
 *                  type: string
 *                  description: Name of the user
 *              email:
 *                  type: string
 *                  format: email
 *                  description: Email of the user, needs to be unique
 *              password:
 *                  type: string
 *                  description: Password of the user to login
 */
module.exports = mongoose.model('User', userSchema);