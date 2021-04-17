const fs = require('fs');
const path = require('path');

class Migrations {
    constructor(db, options = {}) {
        this.db = db;
        this.options = Object.assign({
            migrationsDirectory: __dirname,
            tableName: 'migrations'
        }, options);
        this.isInitialized = false;
        this.lastMigration = false;
        this.migrationsList = [];
    }

    async getLastMigration() {
        const { tableName } = this.options;
        try {
            const res = await this.db.query(`SELECT filename FROM ${tableName} ORDER BY created_at DESC LIMIT 1;`);
            this.lastMigration = res.rows && res.rows.length && res.rows[0].filename || false;
        } catch(err) {
            console.error('Error getting last migration', err.stack);
        }
    }

    async setLastMigration(lastMigration) {
        const { tableName } = this.options;
        this.lastMigration = lastMigration;
        try {
            await this.db.query(`INSERT INTO ${tableName} (filename) VALUES ('${lastMigration}');`);
        } catch(err) {
            console.error(`Error setting last migration: ${lastMigration}`, err.stack);
        }
    }

    async getMigrationsList() {
        const { migrationsDirectory } = this.options;
        try {
            const filesList = await fs.promises.readdir(migrationsDirectory);
            const sqlFilesList = filesList.filter(filename => filename.match(/\.sql$/i, ) !== null);
            this.migrationsList = sqlFilesList.sort();
        } catch(err) {
            console.error('Error getting migrations list', err.stack);
        }
    }

    async init() {
        const { tableName } = this.options;
        try {
            await this.db.query(`CREATE TABLE IF NOT EXISTS ${tableName} (
                filename   TEXT PRIMARY KEY,
                created_at TIMESTAMP NOT NULL DEFAULT NOW()
            );`);
            this.isInitialized = true;
        } catch(err) {
            console.error('Error initializing database migrations', err.stack);
        }
    }

    async run() {
        const { migrationsDirectory } = this.options;
        await this.init();
        if (!this.isInitialized) {
            console.log('Unable to run database migrations');
            return;
        }
        await this.getMigrationsList();
        if (!this.migrationsList.length) {
            console.log(`No database migrations found in ${migrationsDirectory}`);
            return;
        }
        await this.getLastMigration();
        if (this.lastMigration === this.migrationsList[this.migrationsList.length - 1]) {
            console.log('No new database migrations to run');
            return;
        }
        let i = 0;
        if (this.lastMigration) {
            i = this.migrationsList.findIndex(this.lastMigration)
            if (i === -1) {
                console.error(`File not found in ${migrationsDirectory} for last migration run: ${this.lastMigration}`);
            }
        }
        for (i; i < this.migrationsList.length; i++) {
            try {
                const migration = path.join(migrationsDirectory, this.migrationsList[i]);
                const text = await fs.promises.readFile(migration, { encoding: 'utf8' });
                await this.db.query(text);
                await this.setLastMigration(this.migrationsList[i]);
            } catch(err) {
                console.error(`Error running database migration: ${this.migrationsList[i]}`, err.stack);
                break;
            }
        }
    }
}

module.exports = Migrations;
