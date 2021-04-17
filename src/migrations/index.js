const fs = require('fs');
const path = require('path');

class Migrations {
    /**
     * @param db {Pool} PostgreSQL database connection pool.
     * @param options {Object} Options to change default behavior.
     */
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

    /**
     * @returns {Promise<void>}
     */
    async run() {
        // Initialize the database so we can track migrations that have already been run.
        await this._init();
        if (!this.isInitialized) {
            console.log('Unable to run database migrations');
            return;
        }

        // Scan the migrations directory for a sorted array of all SQL file names.
        const { migrationsDirectory } = this.options;
        await this._getMigrationsList();
        if (!this.migrationsList.length) {
            console.log(`No database migrations found in ${migrationsDirectory}`);
            return;
        }

        // Query the migrations table to get the last migration run; stop here if there are no newer migrations.
        await this._getLastMigration();
        if (this.lastMigration === this.migrationsList[this.migrationsList.length - 1]) {
            console.log('No new database migrations to run');
            return;
        }

        // Ensure the last migration run is in the list of migrations (if applicable); if not, something is wrong.
        let i = 0;
        if (this.lastMigration) {
            i = this.migrationsList.findIndex(this.lastMigration)
            if (i === -1) {
                console.error(`File not found in ${migrationsDirectory} for last migration run: ${this.lastMigration}`);
                return;
            } else {
                i++; // To avoid running the last migration again, we need to start with the next migration.
            }
        }

        // Loop through all of the new migrations (if applicable) and run the SQL in a transaction.
        for (i; i < this.migrationsList.length; i++) {
            try {
                const migration = path.join(migrationsDirectory, this.migrationsList[i]);
                const text = await fs.promises.readFile(migration, { encoding: 'utf8' });
                await this.db.query('BEGIN'); // Begin the transaction.
                await this.db.query(text);
                await this._setLastMigration(this.migrationsList[i]); // Update the migrations table accordingly.
                await this.db.query('COMMIT'); // Commit the transaction.
            } catch(err) {
                await this.db.query('ROLLBACK'); // Rollback the transaction.
                console.error(`Error running database migration: ${this.migrationsList[i]}`, err.stack);
                break; // Break out of the loop to avoid running any more migrations, since an error occurred.
            }
        }
    }

    /**
     * @private
     * @returns {Promise<void>}
     */
    async _init() {
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

    /**
     * @private
     * @returns {Promise<void>}
     */
    async _getLastMigration() {
        const { tableName } = this.options;
        try {
            const res = await this.db.query(`SELECT filename FROM ${tableName} ORDER BY created_at DESC LIMIT 1;`);
            this.lastMigration = res.rows && res.rows.length && res.rows[0].filename || false;
        } catch(err) {
            console.error('Error getting last migration', err.stack);
        }
    }

    /**
     * @private
     * @param lastMigration
     * @returns {Promise<void>}
     */
    async _setLastMigration(lastMigration) {
        const { tableName } = this.options;
        this.lastMigration = lastMigration;
        try {
            await this.db.query(`INSERT INTO ${tableName} (filename) VALUES ('${lastMigration}');`);
        } catch(err) {
            console.error(`Error setting last migration: ${lastMigration}`, err.stack);
        }
    }

    /**
     * @private
     * @returns {Promise<void>}
     */
    async _getMigrationsList() {
        const { migrationsDirectory } = this.options;
        try {
            const filesList = await fs.promises.readdir(migrationsDirectory);
            const sqlFilesList = filesList.filter(filename => filename.match(/\.sql$/i, ) !== null);
            this.migrationsList = sqlFilesList.sort();
        } catch(err) {
            console.error('Error getting migrations list', err.stack);
        }
    }
}

module.exports = Migrations;
