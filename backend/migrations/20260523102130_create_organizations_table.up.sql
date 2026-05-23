CREATE TABLE organizations (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    name VARCHAR(255) NOT NULL,
    description TEXT,

    owner_id INTEGER NOT NULL REFERENCES users(id)
);