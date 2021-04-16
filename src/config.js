module.exports = {
    api: {
        host: process.env.APIHOST,
        port: process.env.APIPORT
    },
    database: {
        host: process.env.PGHOST,
        port: process.env.PGPORT,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE
    }
};
