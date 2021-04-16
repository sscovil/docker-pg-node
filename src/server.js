const { api: config } = require('./config');
const database = require('./database');
const http = require('http');
const router = require('./router');

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
    .then(() => {
        console.log('Connected to PostgreSQL database');
        server.listen(config.port);
    })
    .catch(err => console.error('Error connecting to PostgreSQL database', err.stack));
