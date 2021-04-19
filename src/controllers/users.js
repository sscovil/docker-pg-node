const crypto = require('../lib/crypto');
const { logger } = require('../lib/logger');
const db = require('../database');

const signupWithEmail = async (username, password, email) => {
    let passwordHash;
    let tx;
    let userId;

    try {
        passwordHash = await crypto.hash(password);
    } catch(err) {
        logger.error(err, 'Error hashing password on signup with email');
        return false;
    }

    try {
        tx = await db.tx();
    } catch(err) {
        logger.error(err, 'Error creating database transaction');
        return false;
    }

    try {
        await tx.begin(); // Begin the transaction.

        try {
            const result = await tx.query(
                'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id;',
                [username, passwordHash]
            );
            userId = result.rows[0].id;
            logger.info(`Successfully inserted users record on signup with email for user ${userId}`);
        } catch(err) {
            logger.error(err, 'Error inserting users record on signup with email');
            return false;
        }

        try {
            const result = await tx.query(
                'INSERT INTO users_emails (user_id, email) VALUES ($1, $2) RETURNING user_id;',
                [userId, email]
            );
            userId = result.rows[0]['user_id'];
            logger.info(`Successfully inserted users_emails record on signup with email for user ${userId}`);
        } catch(err) {
            logger.error(err, 'Error inserting users_emails record on signup with email');
            return false;
        }

        await tx.commit(); // Commit the transaction.
        return true;
    } catch(err) {
        await tx.rollback(); // Rollback the transaction.
        return false;
    }
};

module.exports = {
    signupWithEmail
};
