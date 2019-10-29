const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

//seting ejs
app.set('view engine', 'ejs');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
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
app.post('/urls/:shortURL/update', (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});
//make new url and replace if with the old one
app.post('/urls/update', (req, res) => {
  let newKey = generateRandomString(6);
  for (let key in urlDatabase) {
    if (urlDatabase[key] === req.body.url)
      if (key !== newKey) {
        Object.defineProperty(urlDatabase, newKey,
          Object.getOwnPropertyDescriptor(urlDatabase, key));
        delete urlDatabase[key];
      }
  }
  res.redirect(`/urls`);
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});