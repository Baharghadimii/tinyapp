const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();

const PORT = 8080; // default port 8080

//seting ejs
app.set('view engine', 'ejs');
app.use(cookieParser());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

//urls object
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//user data object
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

//handle request and response
app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});
//generate random short url via submit
app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  const shrtURL = generateRandomString(6);
  if (!req.body.longURL.includes('https://')) {
    longURL = "https://" + longURL;
  }
  urlDatabase[shrtURL] = longURL;
  res.redirect(`/urls/${shrtURL}`);
});
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});

//redirect to long url
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.send("<html><body>Wrong <b>URL </b></body></html>\n");
  }
});
//redirect to generating page
app.post('/urls/:shortURL', (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});

//make new url and replace if with the old one
app.post('/urls/:shortURL/update', (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.url;
  res.redirect(`/urls`);
});
//add cookie--login
app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('urls');
});
//add cookie--logout
app.post('/logout', (req, res) => {
  res.clearCookie('username', req.body.username);
  res.redirect('urls');
});
//registration page
app.get('/register', (req, res) => {
  res.render('register');
});
app.post('/register', (req, res) => {
  if (req.body.email && req.body.password) {
    if (!hasEmail(req.body.email)) {
      const userId = generateRandomString(5);
      users[userId] = {};
      users[userId]['id'] = userId;
      users[userId]['email'] = req.body.email;
      users[userId]['password'] = req.body.password;
      res.cookie('user_id', userId);
      res.redirect('/urls');
    } else {
      res.status(400).send('Error: 400');
    }

  } else {
    res.status(400).send('Error: 400');
  }

});
//function for random short url
const generateRandomString = function (length) {

  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;

};
const hasEmail = function (email) {
  let condition = false;
  for (let key in users) {
    if (users[key]['email'] === email) {
      condition = true;
    }
  }
  return condition;

};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});