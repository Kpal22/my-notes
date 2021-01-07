const chalk = require('chalk');

const _log = console.log;

const success = (...message) => _log(chalk.green.bgBlack('[Success]', ...message));

const error = (...message) => _log(chalk.red.bgBlack('[Error]', ...message));

const errorObj = (obj) => {
    error();
    _log('%O', obj);
}

module.exports = { success, error, errorObj }