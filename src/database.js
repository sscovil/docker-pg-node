const { database: config } = require('./config');
const { logger } = require('./lib/logger');
const { Pool } = require('pg');

const pool = new Pool(config);

pool.on('error', async (err) => {
    logger.error('Database Error', err.stack);
    await pool.end();
    logger.info('Database connection pool has drained', err.stack);
});

module.exports = pool;
