const { crypto: config } = require('../config');

const crypto = require('crypto');

const hash = (password) => {
    return new Promise((resolve, reject) => {
        crypto.scrypt(password, config.salt, 64, (err, derivedKey) => {
            if (err) {
                reject(err);
            }
            resolve(derivedKey.toString('hex'));
        });
    });
};

module.exports = {
    hash
};
