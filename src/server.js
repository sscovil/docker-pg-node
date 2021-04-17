const { api: config } = require('./config');
const database = require('./database');
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

database
    .connect()
    .catch(err => console.error('Error connecting to PostgreSQL database', err.stack))
    .then(async () => {
        console.log('Connected to PostgreSQL database');
        const migrations = new Migrations(database);
        await migrations.run();
        server.listen(config.port);
    })
    .catch(err => console.error('Error starting server', err.stack));

module.exports = server;
