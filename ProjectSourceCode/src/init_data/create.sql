-- Create custom type for height and span
CREATE TYPE feet_inches AS (
  feet SMALLINT,
  inches SMALLINT
);

-- Create users table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(50),
    height feet_inches,
    span feet_inches,
    age SMALLINT,
    profile_picture INT DEFAULT 0,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create climbs table
CREATE TABLE climbs (
    climb_id SERIAL PRIMARY KEY,
    added_by INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(100),
    grade SMALLINT,
    rating DECIMAL(3, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ascents table
CREATE TABLE ascents (
    ascent_id SERIAL PRIMARY KEY,
    climb_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    comment TEXT,
    suggested_grade SMALLINT,
    rating DECIMAL(3, 2),
    ascent_date DATE,
    FOREIGN KEY (climb_id) REFERENCES climbs(climb_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create follows table
CREATE TABLE follows (
    follower_id INTEGER NOT NULL,
    followed_id INTEGER NOT NULL,
    followed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, followed_id),
    FOREIGN KEY (follower_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (followed_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Insert data into users table
INSERT INTO users (username, full_name, height, span, age, password) VALUES
('climber1', 'Alice Johnson', ROW(5, 7)::feet_inches, ROW(5, 8)::feet_inches, 29, 'hashedpassword1'),
('climber2', 'Bob Smith', ROW(6, 0)::feet_inches, ROW(6, 1)::feet_inches, 34, 'hashedpassword2'),
('climber3', 'Charlie Brown', ROW(5, 10)::feet_inches, ROW(6, 0)::feet_inches, 22, 'hashedpassword3'),
('climber4', 'Diana Prince', ROW(5, 5)::feet_inches, ROW(5, 6)::feet_inches, 27, 'hashedpassword4');

-- Insert data into climbs table
INSERT INTO climbs (added_by, name, location, grade, rating) VALUES
(1, 'Overhanging Hand Traverse', 'Flagstaff Amphitheatre', 1, 4.62),
(1, 'Big Overhang', 'Overhang Wall', 2, 4.84),
(1, 'Upper Y Traverse', 'Upper Y Traverse', 3, 4.104),
(1, 'The Long Traverse aka The Monkey Traverse', 'Monkey Traverse', 4, 4.256),
(1, 'Cloud Shadow Traverse', 'Cloud Shadow', 4, 4.141),
(1, 'Hagan''s Wall', 'Cloud Shadow', 5, 4.159),
(1, 'Face Out', 'King Conquerer', 5, 4.109),
(1, 'First Overhang', 'First Overhang', 6, 4.211),
(1, 'Stranger Than Friction', 'Cloud Shadow', 6, 4.43),
(1, 'Valhalla', 'Dark Side > Incuts Overhang', 7, 4.231),
(1, 'Just Right', 'Capstan', 7, 4.89),
(1, 'Cryptic Magician', 'Dark Side > Cryptic Boulder', 7, 4.40),
(1, 'The Trough Direct SDS', 'Capstan', 8, 4.108),
(1, 'Hollow''s Way', 'Nottim Boulder', 8, 4.15);

-- Insert data into ascents table
INSERT INTO ascents (climb_id, user_id, comment, suggested_grade, rating, ascent_date) VALUES
(1, 1, 'Great traverse, loved the flow!', 1, 4.7, '2023-01-15'),
(2, 1, 'Challenging but fun.', 2, 4.6, '2023-01-18'),
(3, 1, 'The overhang is intense!', 2, 4.9, '2023-02-01'),
(4, 1, 'Felt easier than expected.', 1, 4.8, '2023-02-05'),
(5, 1, 'Perfect for warming up.', 3, 4.1, '2023-02-12'),
(6, 1, 'Could use better holds.', 3, 4.0, '2023-02-20'),
(7, 1, 'One of the best traverses I’ve done.', 4, 4.3, '2023-03-03'),
(8, 1, 'Tougher than it looks!', 5, 4.4, '2023-03-10'),
(9, 1, 'Loved the variety in moves.', 4, 4.2, '2023-03-15'),
(12, 1, 'A little polished in places.', 4, 4.0, '2023-03-20'),
(12, 1, 'Cloud Shadow never disappoints.', 5, 4.5, '2023-03-25'),
(12, 1, 'Good holds but pumpy.', 5, 4.3, '2023-03-28'),
(12, 1, 'Face out was terrifying!', 5, 4.1, '2023-04-02'),
(12, 1, 'A must-try climb.', 6, 4.2, '2023-04-05'),
(12, 1, 'Straightforward but fun.', 6, 4.1, '2023-04-12'),
(12, 1, 'Great overhang practice.', 6, 4.3, '2023-04-15'),
(12, 1, 'Unique friction moves.', 6, 4.4, '2023-04-20'),
(12, 1, 'Pretty technical.', 6, 4.4, '2023-04-25'),
(12, 1, 'Valhalla lives up to the name.', 7, 4.2, '2023-05-01'),
(12, 1, 'Amazing holds.', 7, 4.3, '2023-05-05'),
(12, 1, 'Perfectly balanced climb.', 7, 4.8, '2023-05-12'),
(12, 1, 'Easily my favorite.', 8, 4.9, '2023-05-15'),
(12, 1, 'The crux was tricky.', 7, 4.4, '2023-05-18'),
(12, 1, 'Super satisfying climb.', 7, 4.5, '2023-05-22'),
(12, 1, 'Short but sweet.', 8, 4.1, '2023-05-28'),
(12, 1, 'A solid challenge.', 8, 4.2, '2023-06-01'),
(12, 1, 'Atmospheric and technical.', 8, 4.2, '2023-06-05'),
(12, 1, 'Great end to the day.', 9, 4.3, '2023-06-10');