CREATE TYPE feet_inches AS (
  feet TINYINT,
  inches TINYINT
);

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(50),
    height feet_inches,
    span feet_inches,
    age TINYINT,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE climbs (
    climb_id SERIAL PRIMARY KEY,
    added_by INTEGER NOT NULL
    name VARCHAR(100) NOT NULL,
    location VARCHAR(100),
    grade TINYINT,
    rating DECIMAL(3, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ascents (
    ascent_id SERIAL PRIMARY KEY,
    climb_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    comment TEXT,
    suggested_grade TINYINT,
    rating DECIMAL(3, 2),
    ascent_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (climb_id) REFERENCES climbs(climb_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);