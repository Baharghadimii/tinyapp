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
    username: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
};

let isLogged = false;

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
  if (isLogged) {
    const user = {};
    for (const userId in users) {
      if (userId === req.cookies.user_id) {
        user['username'] = users[userId].username;
      }
    }
    const templateVars = {
      urls: urlDatabase,
      username: user.username,
    };

    res.render("urls_index", templateVars);
  } else {
    res.redirect('/login');
  }

});

app.get("/urls/new", (req, res) => {
  if (isLogged) {
    const user = {};
    for (const userId in users) {
      if (userId === req.cookies.user_id) {
        user['username'] = users[userId].username;
      }
    }
    const templateVars = {
      urls: urlDatabase,
      username: user.username,
    };

    res.render("urls_index", templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const user = {};
  for (const userId in users) {
    if (userId === req.cookies.user_id) {
      user['username'] = users[userId].username;
    }
  }
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: user.username
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
    res.send("<html><body>Wrong URL </b></body></html>\n");
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

//get for login
app.get('/login', (req, res) => {
  let templateVars = { username: "" };
  res.render('login', templateVars);
});

//add cookie--login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  for (const userId in users) {
    const user = users[userId];
    if (user.username === username) {
      if (user.password === password) {
        // log the user in (return) res.send
        isLogged = true;
        res.redirect('/urls');
      } else {
        // passwords don't match res.send
        res.redirect('/login');
      }
    } else {
      // email does not exist res.send
    }
  }
  // final response
  res.redirect('/register');

});
//add cookie--logout
app.post('/logout', (req, res) => {
  res.clearCookie('username', req.body.username);
  isLogged = false;
  res.redirect('/login');
});
//registration page
app.get('/register', (req, res) => {
  // console.log(users);
  let templateVars = { username: "" };
  res.render('register', templateVars);
});
app.post('/register', (req, res) => {
  if (!hasEmail(req.body.username)) {
    const userId = generateRandomString(5);
    users[userId] = {};
    users[userId]['id'] = userId;
    users[userId]['username'] = req.body.username;
    users[userId]['password'] = req.body.password;
    res.cookie('user_id', userId);
    isLogged = true;
    res.redirect('/urls');
  } else {
    res.send(`"<html><body>You've Already registered! </b></body></html>\n"`);
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
  for (let user in users) {
    if (users[user]['username'] === email) {
      condition = true;
    }
  }
  return condition;

};


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});