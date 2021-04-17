module.exports = {
    api: {
        host: process.env.API_HOST,
        port: process.env.API_PORT
    },
    database: {
        host: process.env.POSTGRES_HOST,
        port: process.env.POSTGRES_PORT,
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DATABASE
    }
};
