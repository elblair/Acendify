const express = require('express');
const handlebars = require('express-handlebars');
const Handlebars = require('handlebars');
const path = require('path');

const app = express();
const hbs = handlebars.create({
    extname: 'hbs',
    layoutsDir: __dirname + '/views/layout',
    partialsDir: __dirname + '/views/partials',
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));


// Define routes for pages and apis here 

app.get('/', (req, res) => {
  // Change the name of this page!
  res.render('pages/echo', {
    route: req.path
  });
});

app.get('/welcome', (req, res) => {
    res.json({status: 'success', message: 'Welcome!'});
});

app.get('/echo', (req, res) => {
  res.render('pages/echo', {
    route: req.path
  });
});

app.get('/register', (req, res) => {
  res.render('pages/register',{});
  res.status(200);
});

app.get('/login', (req, res) => {
    res.render('pages/register',{});
    res.status(200);
  });


app.use(express.static(path.join(__dirname, 'public'))); // for infinite scroll

app.get('/path-to-more-content', (req, res) => {
  // You can modify this logic as needed to fetch data from a database or other sources
  const contents = ["First content", "Second content", "Third content"];

  // Render the partial with the new content  
  const contentListFromArray = contents.map(content => 
    `<div class='more-content'><p>${content}</p></div>`
  );

  res.json({contentListFromArray});
});

//
module.exports = app.listen(3000, () => {
    console.log('Server is running on port 3000');
});