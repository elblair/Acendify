const express = require('express'); 
const app = express();
const handlebars = require('express-handlebars');
const path = require('path');
const pgp = require('pg-promise')();
const bodyParser = require('body-parser');
const session = require('express-session'); 
const bcrypt = require('bcryptjs');  


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


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(
  session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
  })
);


const auth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};
 

app.use(express.static(path.join(__dirname, 'public')));
 

const dbConfig = {
  host: process.env.POSTGRES_HOST,
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
};
const db = pgp(dbConfig);


app.get('/', (req, res) => {
  res.redirect('/home');
});

app.get('/home', (req, res) => {
  res.render('pages/home', {
    route: req.path,
    user: req.session.user ? req.session.user : null,
   });
}); 
 

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
  res.render('pages/add_climb', {user: req.session.user});
});


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
        user: req.session.user ? req.session.user : null,
        currentDate: new Date()
      });
    }
    res.render('pages/add_ascent', {
      climbs: climbs,
      currentDate: new Date(),
      user: req.session.user
    });
  } catch (err) {
    console.error('Error fetching climbs:', err);
    res.render('pages/add_ascent', {
      error: 'Error loading climbs. Please try again.',
      user: req.session.user ? req.session.user : null,
      currentDate: new Date()
    });
  }
});


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


app.post('/add_climb', async (req, res) => {
  const { name, location, grade, rating } = req.body;
  
  const query = `
    INSERT INTO climbs (name, location, grade, rating, added_by)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING climb_id
  `;
  const values = [name, location, grade, rating, req.session.user.id];
  db.manyOrNone(query, values)
  .then(data => {
    console.log(data);
    res.render('pages/add_climb',{
      message: "Successfully added climb!",
      user: req.session.user ? req.session.user : null
    });
  })   
  .catch(err => {
    console.error(err);
    res.render('pages/add_climb',{
      error: "Failed to add climb",
      user: req.session.user ? req.session.user : null
    });
  }); 
});


app.post('/add_ascent', auth, async (req, res) => {
try {
  const { climb_id, ascent_date, suggested_grade, rating, comment } = req.body;
      if (!climb_id) {
    const climbs = await db.manyOrNone('SELECT climb_id, name, grade, location FROM climbs ORDER BY name');
    return res.render('pages/add_ascent', {
      error: 'Please select a climb',
      climbs,
      user: req.session.user ? req.session.user : null,
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
  
  const climbs = await db.manyOrNone('SELECT climb_id, name, grade, location FROM climbs ORDER BY name');
  
  res.render('pages/add_ascent', {
    user: req.session.user ? req.session.user : null,
    climbs,
    currentDate: new Date(),
    message: "Added climb successfully"
  });
} catch (err) {
  console.error('Error adding ascent:', err);
  
  const climbs = await db.manyOrNone('SELECT climb_id, name, grade, location FROM climbs ORDER BY name');
  
  res.render('pages/add_ascent', {
    error: 'Error adding ascent. Please try again.',
    user: req.session.user ? req.session.user : null,
    climbs,
    currentDate: new Date()
  });
}
}); 


app.get('/logout', (req, res) => { 
  req.session.destroy();
  res.render('pages/home', {message: "Logged out!"});
});

app.get('/user_settings', auth, async (req, res) => {
  const query = 'SELECT * FROM users WHERE username = $1 LIMIT 1';
  try {  
    const user = await db.oneOrNone(query, [req.session.user.username]);
    if (!user) {
      return res.redirect('/login'); 
    }
    
    
    user.created_at = new Date(user.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric' 
    });
    console.log(user);
    res.render('pages/user_settings', {user: req.session.user ? req.session.user : null, created_at: user.created_at, profile_picture: user.profile_picture, profilePictures: [
      "/images/image1.jpg",
      "/images/image2.jpg",
      "/images/image3.jpg",
      "/images/image4.jpg",
      "/images/image5.jpg",
      "/images/image6.jpg"
    ] });
  } catch (error) {
    console.error('Database error:', error);
  }
}); 


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

app.get('/profile/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const userQuery = `
      SELECT user_id, username, full_name, height, span, age, created_at
      FROM users WHERE user_id = $1
    `;
    
    const ascentsQuery = `
      SELECT a.ascent_id, a.comment, a.suggested_grade, a.rating, a.ascent_date, c.name AS climb_name
      FROM ascents a
      JOIN climbs c ON a.climb_id = c.climb_id
      WHERE a.user_id = $1
      ORDER BY a.ascent_date DESC
    `;

    const user_res = await db.one(userQuery, [userId]);
    const ascents = await db.any(ascentsQuery, [userId]);

    const render_follow_button = req.session.user && req.session.user.id != user_res.user_id;

    function tryCatchSplit(value) {
      try {
        return value.slice(1, -1) 
        .split(",") 
        .map(Number);
      } catch {
        return [null, null];
      }
    }

    const [firstNumber, secondNumber] = tryCatchSplit(user_res.height);

    const [firstNumber2, secondNumber2] = tryCatchSplit(user_res.span);

    res.render('pages/user_profile', {
      user_res,
      user: req.session.user ? req.session.user : null,
      ascents,
      render_follow_button,
      height: {feet: firstNumber, inches: secondNumber},
      span: {feet: firstNumber2, inches: secondNumber2} 
    });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).send('Error fetching user profile');
  }
});  

app.get('/api/search', async (req, res) => {
  const { searchstring, limit = 10 } = req.query;

  if (!searchstring || searchstring.trim() === '') {
    return res.status(400).json({ 
      error: 'Search string is required' 
    });
  }

  try {
    const usersQuery = `
      SELECT 
        *
      FROM users
      WHERE 
        username ILIKE $1 OR 
        full_name ILIKE $1
      LIMIT $2
    `;

    const climbsQuery = `
      SELECT 
        *
      FROM climbs
      WHERE 
        name ILIKE $1 OR 
        location ILIKE $1
      LIMIT $2
    `;

    const searchParam = `%${searchstring}%`;

    const [usersResult, climbsResult] = await Promise.all([
      db.query(usersQuery, [searchParam, limit]),
      db.query(climbsQuery, [searchParam, limit])
    ]);

    res.json({
      users: usersResult,
      climbs: climbsResult
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: 'An error occurred during the search' 
    });
  }});

app.get('/followers', auth, async (req, res) => {
  try {
    const [followsResult, followedByResult] = await Promise.all([
      db.query(`
        SELECT u.user_id, u.username, u.full_name
        FROM follows f
        JOIN users u ON f.followed_id = u.user_id
        WHERE f.follower_id = $1
      `, [req.session.user.id]),
      db.query(`
        SELECT u.user_id, u.username, u.full_name
        FROM follows f
        JOIN users u ON f.follower_id = u.user_id
        WHERE f.followed_id = $1
      `, [req.session.user.id]),
    ]);


    res.render('pages/followers', {
      user: req.session.user ? req.session.user : null,     
      follows: followsResult,
      followedBy: followedByResult,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching follow data');
  }
});

app.post('/follow', async (req, res) => {
  const { followed_id } = req.body;

  try {
    const exists = await db.query(
      'SELECT 1 FROM follows WHERE follower_id = $1 AND followed_id = $2',
      [req.session.user.id, followed_id]
    );
    console.log(exists);
    if (exists.length === 0) {
      console.log("made it in");

      await db.query(
        'INSERT INTO follows (follower_id, followed_id) VALUES ($1, $2)',
        [req.session.user.id, followed_id]
      );
    }

    res.redirect('back');
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).send('Error following user.');
  }
});

app.post('/unfollow', async (req, res) => {
  const { followed_id } = req.body;

  try {
    const follower_id = req.session.user.id; 

    if (!follower_id) {
      return res.status(403).send("You must be logged in to unfollow a user.");
    } 

    await db.query(
      'DELETE FROM follows WHERE follower_id = $1 AND followed_id = $2',
      [follower_id, followed_id]
    );

    res.redirect('back');
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).send('Error unfollowing user.');
  }
});

app.post('/api/user-settings', async (req, res) => {
  const {
    full_name,
    age,
    profile_picture,
    height: { feet: heightFeet, inches: heightInches },
    span: { feet: spanFeet, inches: spanInches },
  } = req.body;

  try {
    
    if (!full_name) {
      return res.status(400).send('<h1>Error: Full name is required.</h1>');
    }

    
    const query = `
      UPDATE users 
      SET 
        full_name = $1,
        age = $2,
        height = ROW($3, $4)::feet_inches,
        span = ROW($5, $6)::feet_inches,
        profile_picture = $7
      WHERE user_id = $8
      RETURNING *;
    `;

    const values = [
      full_name,
      age || null,
      heightFeet || null,
      heightInches || null,
      spanFeet || null,
      spanInches || null,
      profile_picture || null,
      req.session.user.id, 
    ];

    const result = await db.query(query, values);

    /*if (result.rows.length === 0) {
      return res.status(404).send('<h1>Error: User not found.</h1>');
    }*/

    
    res.redirect("back");
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).send('<h1>An error occurred while updating the profile.</h1>');
  }
});


module.exports = app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
