const express = require('express'); 
const app = express();
const handlebars = require('express-handlebars');
const path = require('path');
const pgp = require('pg-promise')();
const bodyParser = require('body-parser');
const session = require('express-session'); 
const bcrypt = require('bcryptjs'); 
const axios = require('axios'); 

// Configure Handlebars
const hbs = handlebars.create({
    extname: 'hbs',
    layoutsDir: path.join(__dirname, 'views/layout'),
    partialsDir: path.join(__dirname, 'views/partials'),
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Middleware for parsing JSON and URL-encoded form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session middleware
app.use(
  session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
  })
);

// Database configuration
const dbConfig = {
  host: 'db',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
};
const db = pgp(dbConfig);

// Route to render homepage
app.get('/', (req, res) => {
  res.render('pages/echo', {
    route: req.path,
    username: req.session.user ? req.session.user.username : null
  });
});

// Routes for rendering login and register pages
app.get('/login', (req, res) => {
  res.render('pages/login');
});

app.get('/register', (req, res) => {
  res.render('pages/register');
});

// Login route
app.post('/login', (req, res) => {
  const query = 'SELECT * FROM users WHERE username = $1 LIMIT 1';
  console.log(req.body.username)
  db.one(query, [req.body.username])
    .then(async data => {
      const match = await bcrypt.compare(req.body.password, data.password);
      if (match) {
        req.session.user = { username: data.username, id: data.user_id };
        req.session.save();
        res.redirect('/');
      } else {
        res.render('pages/login', { message: 'Incorrect username or password' });
      }
    })
    .catch(err => {
      console.error(err);
      res.redirect('/login');
    });
});

// Register route
app.post('/register', async (req, res) => {
  try {
    const hash = await bcrypt.hash(req.body.password, 10);
    const insertQuery = `INSERT INTO users (username, password) VALUES ($1, $2) RETURNING username`;
    const data = await db.one(insertQuery, [req.body.username, hash]);
    console.log(`User registered: ${data.username}`);
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.redirect('/register');
  }
});

//Logout route 
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.render('pages/logout');
});

// Middleware for authentication
const auth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};

// user settings page route
app.get('/user_settings', auth, async (req, res) => {
  const query = 'SELECT user_id, username, created_at FROM users WHERE username = $1 LIMIT 1';
  try {
    const user = await db.oneOrNone(query, [req.session.user.username]);
    if (!user) {
      return res.redirect('/login');
    }
    
    // Format the date to be more readable
    user.created_at = new Date(user.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    res.render('pages/user_settings', user);
  } catch (error) {
    console.error('Database error:', error);
  }
});
// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Infinite scroll content route
app.get('/path-to-more-content', (req, res) => {
  const contents = ["First content", "Second content", "Third content"];
  const contentListFromArray = contents.map(content => 
    `<div class='more-content'><p>${content}</p></div>`
  );
  res.json({ contentListFromArray });
});

// Start server
app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
