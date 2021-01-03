const chalk = require('chalk');

const _log = console.log;

const log = (...message) => _log(chalk.white.bgBlack('[Log]', ...message));

const info = (...message) => _log(chalk.blue.bgBlack('[Info]', ...message));

const success = (...message) => _log(chalk.green.bgBlack('[Success]', ...message));

const warning = (...message) => _log(chalk.yellow.bgBlack('[Warning]', ...message));

const error = (...message) => _log(chalk.red.bgBlack('[Error]', ...message));

const logObj = (obj, ...message) => {
    log();
    _log('%O', obj);
    if (message.length > 0) {
        _log(chalk.white.bgBlack(...message));
    }
}

const infoObj = (obj, ...message) => {
    info();
    _log('%O', obj);
    if (message.length > 0) {
        _log(chalk.blue.bgBlack(...message));
    }
}

const successObj = (obj, ...message) => {
    success();
    _log('%O', obj);
    if (message.length > 0) {
        _log(chalk.green.bgBlack(...message));
    }
}

const warningObj = (obj, ...message) => {
    warning();
    _log('%O', obj);
    if (message.length > 0) {
        _log(chalk.yellow.bgBlack(...message));
    }
}

const errorObj = (obj, ...message) => {
    error();
    _log('%O', obj);
    if (message.length > 0) {
        _log(chalk.red.bgBlack(...message));
    }
}

module.exports = { log, info, success, warning, error, logObj, infoObj, successObj, warningObj, errorObj }