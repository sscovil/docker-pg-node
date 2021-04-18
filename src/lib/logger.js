const pino = require('pino');
const pinoHttp = require('pino-http');

const logger = pino();

const httpLogger = pinoHttp({
    logger: logger,
    customLogLevel: (res, err) => {
        if (res.statusCode >= 400 && res.statusCode < 500) {
            return 'warn'
        } else if (res.statusCode >= 500 || err) {
            return 'error'
        }
        return 'info'
    },
    customSuccessMessage: (res) => {
        if (res.statusCode === 404) {
            return 'Resource not found'
        }
        return 'Request completed'
    },
    customErrorMessage: (error, res) => {
        return 'Request errored with status code: ' + res.statusCode
    }
});

module.exports = {
    logger,
    httpLogger
};
