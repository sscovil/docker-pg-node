const { Pool } = require('pg');
const { database: config } = require('./config');

const pool = new Pool(config);

pool.on('error', async (err) => {
    console.error('Database Error', err.stack);
    await pool.end();
    console.error('Database connection pool has drained', err.stack);
});

module.exports = pool;
