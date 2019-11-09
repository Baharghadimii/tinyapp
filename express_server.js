/* eslint-disable camelcase */
//setup
const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const app = express();
const bodyParser = require("body-parser");
const { generateRandomString } = require('./helpers');
const { getUserByEmail } = require('./helpers');
const { urldForUsers } = require('./helpers');
const { isNewUrl } = require('./helpers');

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
  b6UTxQ: { longURL: "https://www.tsn.ca", userId: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userId: "aJ48lW" }
};

//user data object
const users = {
  "2br03": {
    id: "userRandomID",
    username: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
};

//boolean variable to check if the user is logged in

app.get('/', (req, res) => {
  res.redirect('/urls');
});
//urls page
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;

  let templateVars = {
    username: '',
    urls: urldForUsers(userID, urlDatabase)
  };

  //check if the user is logged in
  if (userID) {
    if (users[req.session.user_id]) {
      templateVars['username'] = users[req.session.user_id].username;
    }
    res.render("urls_index", templateVars);

  } else {
    //render a page with error message if the user is not logged in
    res.render("not_logged_in", templateVars);
  }
});

app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;

  if (!longURL.includes('http')) {
    longURL = `http://${longURL}`;
  }
  const userId = req.session.user_id;
  const shrtURL = generateRandomString(6);

  //check if submitted url is in database
  if (!isNewUrl(longURL, urlDatabase)) {
    const templateVar = { username: users[req.session.user_id].username };
    //render a page with error message
    res.render('not_new_url', templateVar);
  } else {
    urlDatabase[shrtURL] = { longURL, userId };

    res.redirect(`/urls/${shrtURL}`);
  }

});
//new url page
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: '',
  };
  if (req.session.user_id) {
    if (users[req.session.user_id]) {
      templateVars['username'] = users[req.session.user_id].username;
    }

    res.render("urls_new", templateVars);
  } else {
    //render a page with error message if the user is not logged in
    res.render("not_logged_in", templateVars);

  }
});
//show long URL and short URL page
app.get("/urls/:shortURL", (req, res) => {
  const user = {};

  //check if the user is logged in
  if (req.session.user_id) {

    //check if the url is in database
    if (!urlDatabase[req.params.shortURL]) {
      const templateVar = { username: users[req.session.user_id].username };

      //render a page with error message
      res.render('not_valid_url', templateVar);

    }
    //check if the user owns the url
    if (req.session.user_id !== urlDatabase[req.params.shortURL].userId) {
      const templateVar = { username: users[req.session.user_id].username };

      //render a page with error message
      res.render('not_access', templateVar);
    }
    for (const userId in users) {

      if (users[userId]['id'] === req.session.user_id) {
        user['username'] = users[userId].username;
      }
    }

    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL]['longURL'],
      username: user.username
    };

    res.render("urls_show", templateVars);

  } else {
    const templateVars = {
      username: '',
    };
    res.render("not_logged_in", templateVars);
  }

});

app.post('/urls/:shortURL', (req, res) => {

  const longURL = req.body.url;

  const userId = req.session.user_id;

  //check if submitted url is in database
  if (isNewUrl(longURL, urlDatabase)) {
    if (req.session.user_id === urlDatabase[req.params.shortURL].userId) {

      urlDatabase[req.params.shortURL] = { longURL, userId };
      res.redirect(`/urls`);

    } else {
      const templateVar = { username: users[req.session.user_id].username };

      //render a page with error message
      res.render('not_allowed', templateVar);
    }

  } else {
    const templateVar = { username: users[req.session.user_id].username };
    //render a page with error message
    res.render('not_new_url', templateVar);
  }

});

app.get("/u/:shortURL", (req, res) => {

  //check if the url is valid
  if (!urlDatabase[req.params.shortURL]) {
    const templateVar = { username: users[req.session.user_id].username };

    //render a page with error message
    res.render('not_valid_url', templateVar);

  } else {
    //redirect to corresponding URL
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  }
});


//edit and delete posts
app.post('/urls/:shortURL/delete', (req, res) => {

  if (req.session.user_id === urlDatabase[req.params.shortURL].userId) {
    delete urlDatabase[req.params.shortURL];
    res.redirect(`/urls`);
  } else {
    const templateVar = { username: users[req.session.user_id].username };

    //render a page with error message
    res.render('not_allowed', templateVar);
  }

});

//get for login
app.get('/login', (req, res) => {
  if (req.session.user_id) {
    const templateVars = { username: users[req.session.user_id].username };
    res.render('not_logged_out', templateVars);
  } else {
    let templateVars = { username: "" };
    res.render('login', templateVars);
  }

});

//add cookie--login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = getUserByEmail(username, users);
  if (user) {
    if (bcrypt.compareSync(password, user.password)) {
      // log the user in (return) res.send
      req.session.user_id = user.id;
      res.redirect('/urls');
    }
  }
  // final response
  const templateVars = { username: '' };
  res.render('not_correct_user_pass', templateVars);
});

//add cookie--logout
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

//registration page
app.get('/register', (req, res) => {
  let templateVars = { username: "" };

  //check if the user is logged in
  if (req.session.user_id) {
    const templateVars = { username: users[req.session.user_id]['username'] };
    res.render('not_logged_out', templateVars);
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