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

app.get('/welcome', (req, res) => {
    res.json({status: 'success', message: 'Welcome!'});
  });

app.get('/register', (req, res) => {
  res.render('pages/register',{});
  res.status(200);
});

app.get('/login', (req, res) => {
    res.render('pages/register',{});
    res.status(200);
  });


app.get("*", (req, res) => {
    res.render("pages/echo", {
        route: req.path
    })
})

//
module.exports = app.listen(3000, () => {
    console.log('Server is running on port 3000');
});