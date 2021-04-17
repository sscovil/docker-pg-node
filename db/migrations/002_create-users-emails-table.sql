CREATE TABLE users_emails (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users (id),
    email TEXT UNIQUE NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP
);
