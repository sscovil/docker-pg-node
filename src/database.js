const { Client } = require('pg');
const { database: config } = require('./config');

const client = new Client(config);

client.on('error', err => console.error('Database Error', err.stack));

module.exports = client;
