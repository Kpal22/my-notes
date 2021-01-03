const User = require('../models/user');
const { genToken } = require('../configs/auth');
const logger = require('../logger');

const getError = error => {
    const errorMsg = error.message.toLowerCase();
    if (errorMsg.includes('validation failed')) {
        error = { status: 400, message: error.message.split('validation failed:')[1].replace(/:/g, '') };
    } else if (errorMsg.includes('login failed!')) {
        error = { status: 401, message: 'Login Failed!' };
    } else if (errorMsg.includes('data not found')) {
        logger.errorObj(error);
        error = { status: 404, message: 'Data Not Found!' };
    } else if (errorMsg.includes('duplicate key')) {
        error = { status: 409, message: 'Email Already Exists!' };
    } else {
        logger.errorObj(error);
        error = { status: 500, message: 'Server Error!' };
    }
    return error;
}

const save = async ({ name, email, password } = {}) => {
    try {
        const user = new User({ name, email, password });
        const token = genToken({ _id: user._id.toString() });
        user.tokens.push({ token });
        await user.save();
        return { token };
    } catch (err) {
        throw getError(err);
    }
}

const login = async ({ email, password } = {}) => {
    try {
        const user = await User.findByCredentials(email, password);
        user.tokens = user.tokens.filter(token => token.expiresAt >= Date.now());
        const token = genToken({ _id: user._id.toString() });
        user.tokens.push({ token });
        await user.save();
        return { token };
    } catch (err) {
        throw getError(err);
    }
}

module.exports = { save, login };