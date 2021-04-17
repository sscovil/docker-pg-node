const { api: config } = require('./config');
const pool = require('./database');
const router = require('./router');
const Migrations = require('./migrations');
const http = require('http');

const server = http.createServer(router);

server.on('clientError', (err, socket) => {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

server.on('listening', () => {
    const { host, port } = config;
    console.log(`Server listening at http://${host}:${port}`);
});

(async () => {
    const db = await pool.connect();
    console.log('Created connection pool for PostgreSQL database');
    const migrations = new Migrations(db);
    await migrations.run();
    server.db = db;
    server.listen(config.port);
})().catch(err => console.error('Error starting server', err.stack));

module.exports = server;
