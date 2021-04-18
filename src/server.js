const { api: config } = require('./config');
const { logger } = require('./lib/logger');
const pool = require('./database');
const router = require('./router');
const Migrations = require('./lib/migrations');

const http = require('http');
const os = require("os")
const cluster = require("cluster")

async function createCluster() {
    const cpuCount = os.cpus().length;
    const shouldConnectDB = cpuCount === 1 || cluster.isMaster;
    const shouldCreateCluster = cpuCount > 1 && cluster.isMaster;
    const shouldStartServer = cpuCount === 1 || cluster.isWorker;

    if (shouldConnectDB) {
        const db = await createDBConnectionPool();
        if (db) {
            await runDBMigrations(db);
        }
    }

    if (shouldCreateCluster) {
        for (let i = 0; i < cpuCount; i++) {
            cluster.fork();
        }
        cluster.on('exit', worker => {
            logger.info(`Worker ${worker.id} has exited`);
        });

        return cluster;
    }

    if (shouldStartServer) {
        return await createServer();
    }
}

async function createDBConnectionPool() {
    try {
        const db = await pool.connect();
        logger.info('Created connection pool for PostgreSQL database');
        return db;
    } catch(err) {
        logger.error('Error creating connection pool for PostgreSQL database', err.stack);
    }
    return false;
}

async function createServer() {
    const server = http.createServer(router);

    server.on('clientError', (err, socket) => {
        socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    });

    server.on('listening', () => {
        const { host, port } = config;
        logger.info(`Server listening at http://${host}:${port} on process ${process.pid}`);
    });

    try {
        server.listen(config.port);
    } catch(err) {
        logger.error('Error starting server', err.stack);
    }

    return server;
}

async function runDBMigrations(db) {
    try {
        const migrations = new Migrations(db);
        await migrations.run();
    } catch(err) {
        logger.error('Error setting up database', err.stack);
    }
}

if (require.main === module) {
    (async () => {
        await createCluster();
    })().catch(err => {
        console.error('Error starting server cluster', err.stack);
    });
}
