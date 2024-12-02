const express = require('express'); 
const app = express();
const handlebars = require('express-handlebars');
const path = require('path');
const pgp = require('pg-promise')();
const bodyParser = require('body-parser');
const session = require('express-session'); 
const bcrypt = require('bcryptjs'); 

// Configure Handlebars
const hbs = handlebars.create({
    extname: 'hbs',
    layoutsDir: path.join(__dirname, 'views/layout'),
    partialsDir: path.join(__dirname, 'views/partials'),
});
hbs.handlebars.registerHelper('eq', function(a, b) {
  return a === b;
});
hbs.handlebars.registerHelper('formatDate', function(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
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

// Middleware for authentication
const auth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};

// Serve static
app.use('/public', express.static(path.join(__dirname, 'public')));

// Database configuration
const dbConfig = {
  host: process.env.POSTGRES_HOST,
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
};
const db = pgp(dbConfig);

// Route to render homepage
app.get('/', (req, res) => {
  res.redirect('/home');
});

app.get('/home', (req, res) => {
  res.render('pages/home', {
    route: req.path,
    username: req.session.user ? req.session.user.username : null
  });
});

// Routes for rendering pages
app.get('/login', (req, res) => {
  res.render('pages/login');
});

app.get('/register', (req, res) => {
  res.render('pages/register',{});
  res.status(200);
});

app.get('/login', (req, res) => {
    res.render('pages/register',{});
    res.status(200);
  });

app.get('/add_climb', auth, (req,res) => {
  res.render('pages/add_climb', req.session.user);
});

// get add_ascent route 
app.get('/add_ascent', auth, async (req, res) => {
  try {
    const query = `
      SELECT climb_id, name, grade, location 
      FROM climbs 
      ORDER BY name ASC
    `;
    const climbs = await db.manyOrNone(query);
    
    if (!climbs || climbs.length === 0) {
      return res.render('pages/add_ascent', {
        error: 'No climbs available in the database. Please add some climbs first.',
        currentDate: new Date()
      });
    }
    res.render('pages/add_ascent', {
      climbs: climbs,
      currentDate: new Date(),
      username: req.session.user.username
    });
  } catch (err) {
    console.error('Error fetching climbs:', err);
    res.render('pages/add_ascent', {
      error: 'Error loading climbs. Please try again.',
      currentDate: new Date()
    });
  }
});
//show my ascents route 
app.get('/ascents', auth, async (req, res) => {
  try {
    const query = `
      SELECT a.*, c.name as climb_name, c.grade, c.location
      FROM ascents a
      JOIN climbs c ON a.climb_id = c.climb_id
      WHERE a.user_id = $1
      ORDER BY a.ascent_date DESC
    `;
    
    const ascents = await db.manyOrNone(query, [req.session.user.id]);
    const hasAscents = ascents && ascents.length > 0;
    
    const countQuery = `
      SELECT COUNT(*) as total_ascents
      FROM ascents
      WHERE user_id = $1 
    `;
    const countResult = await db.one(countQuery, [req.session.user.id]);
    
    res.render('pages/ascents', { 
      ascents,
      hasAscents,
      totalAscents: countResult.total_ascents,
      username: req.session.user.username 
    });
  } catch (err) {
    console.error('Error fetching ascents:', err);
    res.redirect('/');
  }
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
        res.render('pages/login', {message: 'Incorrect username or password'});
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
    const existingUser = await db.oneOrNone('SELECT username FROM users WHERE username = $1', [req.body.username]);
    if (existingUser) {
      return res.render('pages/register', { 
        error: 'Username already exists'
      });
    }

    const hash = await bcrypt.hash(req.body.password, 10);
    const insertQuery = `INSERT INTO users (username, password) VALUES ($1, $2) RETURNING username`;
    const data = await db.one(insertQuery, [req.body.username, hash]);
    console.log(`User registered: ${data.username}`);
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.render('pages/register', {
      error: 'Registration failed. Please try again.'
    });
  }
});

//add climb route
app.post('/add_climb', async (req, res) => {
  const { name, location, grade, rating } = req.body;
  
  const query = `
    INSERT INTO climbs (name, location, grade, rating)
    VALUES ($1, $2, $3, $4)
    RETURNING climb_id
  `;
  
  const values = [name, location, grade, rating];
  db.manyOrNone(query, values)
  .then(data => {
    console.log(data);
    res.redirect('/login');
  })   
  .catch(err => {
    console.error(err);
    res.redirect('/add_climb');
  });
});

//add ascent route
app.post('/add_ascent', auth, async (req, res) => {
try {
  const { climb_id, ascent_date, suggested_grade, rating, comment } = req.body;
      if (!climb_id) {
    const climbs = await db.manyOrNone('SELECT climb_id, name, grade, location FROM climbs ORDER BY name');
    return res.render('pages/add_ascent', {
      error: 'Please select a climb',
      climbs,
      currentDate: new Date()
    });
  }

  const query = `
    INSERT INTO ascents (
      climb_id,
      user_id,
      ascent_date,
      suggested_grade,
      rating,
      comment
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING ascent_id
  `;

  const values = [
    climb_id,
    req.session.user.id,
    ascent_date || new Date(),
    suggested_grade,
    rating,
    comment
  ];

  await db.one(query, values);

  res.redirect('/ascents');
  
} catch (err) {
  console.error('Error adding ascent:', err);
  
  const climbs = await db.manyOrNone('SELECT climb_id, name, grade, location FROM climbs ORDER BY name');
  
  res.render('pages/add_ascent', {
    error: 'Error adding ascent. Please try again.',
    climbs,
    currentDate: new Date()
  });
}
}); 
 
// Infinite scroll content route
app.get('/path-to-more-content', (req, res) => {
  const contents = ["First content", "Second content", "Third content"];
  res.json(contents);
});

//Logout route 
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.render('pages/logout');
});
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

// Endpoint to fetch ascents
app.get('/api/ascents', async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 5;
  const offset = parseInt(req.query.offset, 10) || 0;

  try {  
    const result = await db.manyOrNone(
      `SELECT ascent_id, climb_id, user_id, comment, suggested_grade, rating, ascent_date 
       FROM ascents
       ORDER BY ascent_date DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    const climbs = await db.manyOrNone(
      'SELECT climb_id, name, grade location FROM climbs');
    const users = await db.manyOrNone(
      'SELECT username, user_id FROM users');
      

    res.json([result, climbs, users]);
  } catch (err) {
    console.error('Error fetching results:', err.message);
    res.status(500).send('Error fetching ascents');
  }
});



//
module.exports = app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
