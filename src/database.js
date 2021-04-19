const { database: config } = require('./config');
const { logger } = require('./lib/logger');
const { Pool } = require('pg');

const pool = new Pool(config);

pool.on('error', (err) => {
    logger.error(err, 'An idle database connection client has experienced an error');
});

/**
 * You must use the same client instance for all statements within a transaction. PostgreSQL isolates a transaction
 * to individual clients. This means if you initialize or use transactions with the pool.query method you will have
 * problems. Do not use transactions with the pool.query method.
 *
 * @returns {Promise<Client>} Resolves with a modified Client object that has begin, commit, and rollback functions.
 */
pool.tx = async () => {
    const client = await pool.connect(); // Must release the connection back to the pool after a commit or rollback.
    client.begin = () => client.query('BEGIN');
    client.commit = () => client.query('COMMIT').finally(() => client.release());
    client.rollback = async () => client.query('ROLLBACK').finally(() => client.release());
    return client;
};

module.exports = pool;
