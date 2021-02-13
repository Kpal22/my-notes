const User = require('../models/user');
const { genToken } = require('../configs/auth');
const logger = require('../logger');

const getError = error => {
    const errorMsg = error.message.toLowerCase();
    if (errorMsg.includes('validation failed')) {
        error = { status: 400, message: error.message.split('validation failed:')[1].replace(/:/g, '') };
    } else if (errorMsg.includes('login failed!')) {
        error = { status: 401, message: 'Login Failed!' };
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
        return { name, email, ... await genTokenObj(new User({ name, email, password })) };
    } catch (err) {
        throw getError(err);
    }
}

const login = async ({ email, password } = {}) => {
    try {
        const user = await User.findByCredentials({ email, password });
        user.tokens = user.tokens.filter(token => token.expiresAt >= Date.now());
        return { name: user.name, email, ... await genTokenObj(user) };
    } catch (err) {
        throw getError(err);
    }
}

const genTokenObj = async user => {
    const token = genToken({ _id: user._id.toString() });
    user.tokens.push({ token });
    await user.save();
    const tokenExpiresOn = +user.tokens.find(userToken => userToken.token === token).expiresAt;
    return ({ token, tokenExpiresOn });
}

module.exports = { save, login };