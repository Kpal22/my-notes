// const mongoose = require('mongoose');
const logger = require('../logger');

module.exports = require('mongoose')
    .connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    })
    .then(res => {
        logger.success('MongoDB connection successful');
        return res;
    })
    .catch(err => {
        logger.error(err.message ,'Error while connecting to MongoDB');
        throw err;
    });