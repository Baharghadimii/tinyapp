/* eslint-disable camelcase */
//setup
const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const app = express();
const bodyParser = require("body-parser");
const {generateRandomString} = require('./helpers');
const {getUserByEmail} = require('./helpers');

const PORT = 8080;

//middlewares
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieSession({
  name: 'tinyUrl',
  keys: ['bahargh'],
}));

//urls object
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

//user data object
const users = {
  "userRandomID": {
    id: "userRandomID",
    username: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
};

//boolean variable to check if the user is logged in
let isLogged = false;

app.get('/', (req, res) => {
  res.redirect('/urls');
});
//urls page
app.get("/urls", (req, res) => {
  let templateVars = {
    username: '',
    urls: urlDatabase
  };
  if (isLogged) {
    for (const userId in users) {
      if (userId === req.session.user_id) {
        templateVars['username'] = users[userId].username;
      }
    }

    res.render("urls_index", templateVars);

  } else {
    //render a page with error message if the user is not logged in
    res.render("not_logged_in", templateVars);
  }
});

app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  const userId = req.session.user_id;
  const shrtURL = generateRandomString(6);
  let isFound = false;
  for (const id in urlDatabase) {
    if (urlDatabase[id].longURL === longURL) {
      isFound = true;
      res.send(`<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>Register</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">      
      </head>
      <body>
        <main style="margin: 1em;">
      <h2>You've already added this URL!</h2>
      <form action="/urls/new" method="POST">
        <button type="submit" class="btn btn-primary">Back</button>
      </form>
          </main>
      </body>
      </html>`);
    }
  }
  if (!isFound) {
    urlDatabase[shrtURL] = { longURL, userId };
    res.redirect(`/urls`);
  }

});
//new url page
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: '',
  };
  if (isLogged) {
    for (const userId in users) {
      if (userId === req.session.user_id) {
        templateVars['username'] = users[userId].username;
      }
    }


    res.render("urls_new", templateVars);
  } else {
    //render a page with error message if the user is not logged in
    res.render("not_logged_in", templateVars);

  }
});

app.post('/urls/:shortURL', (req, res) => {
  res.redirect(`/urls`);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);

});
//show long URL and short URL page
app.get("/urls/:shortURL", (req, res) => {
  const user = {};
  for (const userId in users) {
    if (userId === req.session.user_id) {
      user['username'] = users[userId].username;
    }
  }
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]['longURL'],
    username: user.username
  };
  res.render("urls_show", templateVars);

});
//edit and delete posts
app.post('/urls/:shortURL/delete', (req, res) => {

  if (req.session.user_id === urlDatabase[req.params.shortURL].userId) {
    delete urlDatabase[req.params.shortURL];
    res.redirect(`/urls`);
  } else {
    res.send(`<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <title>Register</title>
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
    
    </head>
    <body>
      <main style="margin: 1em;">
    <h2>You are not allowed to edit or delete this URL!</h2>
    <form action="/urls" method="GET">
      <button type="submit" class="btn btn-primary">Back</button>
    </form>
        </main>
    </body>
    </html>`);
  }

});
app.post('/urls/:shortURL/update', (req, res) => {
  const longURL = req.body.url;
  const userId = req.session.user_id;
  if (req.session.user_id === urlDatabase[req.params.shortURL].userId) {
    urlDatabase[req.params.shortURL] = { longURL, userId };
    res.redirect(`/urls`);
  } else {
    res.send(`<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <title>Register</title>
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">

    </head>
    <body>
      <main style="margin: 1em;">
    <h2>You are not allowed to edit or delete this URL!</h2>
    <form action="/urls" method="GET">
      <button type="submit" class="btn btn-primary">Back</button>
    </form>
        </main>
    </body>
    </html>`);
  }

});

//get for login
app.get('/login', (req, res) => {
  if (isLogged) {
    res.redirect('urls');
  } else {
    let templateVars = { username: "" };
    res.render('login', templateVars);
  }

});

//add cookie--login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  for (const userId in users) {
    const user = users[userId];
    // console.log(getUserByEmail(req.body.username, users));
    if (user.username === username) {
      if (bcrypt.compareSync(password, user.password)) {
        // log the user in (return) res.send
        isLogged = true;
        req.session.user_id = userId;
        res.redirect('/urls');
      }
    }
  }
  // final response
  res.redirect('/register');

});

//add cookie--logout
app.post('/logout', (req, res) => {
  isLogged = false;
  req.session = null;
  res.redirect('/login');
});

//registration page
app.get('/register', (req, res) => {
  let templateVars = { username: "" };

  //check if the user is registered before
  if (isLogged) {
    res.redirect('/urls');
  } else {

    res.render('register', templateVars);
  }
});

app.post('/register', (req, res) => {
  if (!getUserByEmail(req.body.username, users)) {
    const userId = generateRandomString(5);
    users[userId] = {};
    users[userId]['id'] = userId;
    users[userId]['username'] = req.body.username;
    users[userId]['password'] = bcrypt.hashSync(req.body.password, 10);
    req.session.user_id = userId;
    isLogged = true;
    res.redirect('/urls');
  } else {
    //render a page with error message if the user is not registered yet
    const templateVar = { username: "" };
    res.render('not_registered', templateVar);
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});