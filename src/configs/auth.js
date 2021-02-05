const User = require('../models/user');
const jwt = require('jsonwebtoken');
const logger = require('../logger');
const validator = require('validator');

const privateKEY = process.env.PRIVATE_KEY.replace(/\[n\]/g, '\n');
const publicKEY = process.env.PUBLIC_KEY.replace(/\[n\]/g, '\n');

const signOptions = { expiresIn: '60m', algorithm: 'RS256' };

const verifyOptions = { algorithm: ['RS256'] };

const getError = err => {
    switch (err.message) {
        case 'token not found':
        case 'jwt malformed':
        case 'invalid token':
        case 'jwt expired':
        case 'user not found':
            return { status: 401, message: 'Authentication Failed!' };
        default:
            logger.errorObj(err);
            return { status: 500, message: 'Server Error!' };
    }
}

const auth = async (req, _res, next) => {
    try {
        if (!req.header('Authorization')) {
            throw new Error('token not found');
        }
        const token = req.header('Authorization').replace('Bearer ', '');
        if (!validator.isJWT(token)) {
            throw new Error('invalid token');
        }
        const decoded = jwt.verify(token, publicKEY, verifyOptions);
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });
        if (!user) {
            throw new Error('user not found');
        } else {
            req.token = token;
            req.user = user;
            next();
        }
    } catch (err) {
        next(getError(err));
    }
}

const genToken = payload => jwt.sign(payload, privateKEY, signOptions);

module.exports = { auth, genToken }