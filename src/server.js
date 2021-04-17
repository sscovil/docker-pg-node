const { api: config } = require('./config');
const pool = require('./database');
const router = require('./router');
const Migrations = require('./lib/migrations');

const http = require('http');
const os = require("os")
const cluster = require("cluster")

async function createCluster() {
    const cpuCount = os.cpus().length;

    if (cpuCount > 1) {
        if (cluster.isMaster) {
            for (let i = 0; i < cpuCount; i++) {
                cluster.fork();
            }
            cluster.on('exit', worker => {
                console.log(`Worker ${worker.id} has exited`);
            });
        } else {
            await createServer();
        }
    } else {
        await createServer();
    }
}

async function createServer() {
    const server = http.createServer(router);

    server.on('clientError', (err, socket) => {
        socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    });

    server.on('listening', () => {
        const { host, port } = config;
        console.log(`Server listening at http://${host}:${port} on process ${process.pid}`);
    });

    try {
        server.listen(config.port);
    } catch(err) {
        console.error('Error starting server', err.stack);
    }

    return server;
}

if (require.main === module) {
    (async () => {
        // TODO: Create a database connection client for migrations, and a connection pool for the router.
        const db = await pool.connect();
        console.log('Created connection pool for PostgreSQL database');
        const migrations = new Migrations(db);
        await migrations.run();
        await createCluster();
    })().catch(err => {
        console.error('Error starting server cluster', err.stack);
    });
}
