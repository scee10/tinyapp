// ------------------- DEPENDENCIES -------------------------
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require('bcryptjs');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const { generateRandomString, urlsForUser, getUserByEmail } = require('./helpers');
const { urlDatabase, users } = require('./databases');

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2', 'key3'],
}));

// ------------------- GET -------------------------

// "home page"
app.get("/", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  res.redirect("/urls");
});

// page that shows all urls that belong to specific user
app.get("/urls", (req, res) => {
  let filteredURLS = {};

  if (req.session.user_id) {
    filteredURLS = urlsForUser(req.session.user_id.id, urlDatabase);
  }

  const templateVars = {
    // will ONLY display URLS that belong to the user
    urls: filteredURLS,
    user_id: req.session.user_id
  };

  res.render("urls_index", templateVars);
});

// page will bring you to the appropriate website with the short url
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.send("Uh-oh! URL no longer exist!");
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// this allows you to create a new URL and renders the urls_new page
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user_id: req.session.user_id
  };

  // checking if you're logged in or not
  if (req.session.user_id) {
    return res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (!req.session.user_id) {
    return res.status(400).send("Uh-oh! URL does not exist!");
  }

  const filteredURLS = urlsForUser(req.session.user_id.id, urlDatabase);

  // if for the specific id in filteredURLS does not exist, throw error
  if (!filteredURLS[req.params.shortURL]) {
    return res.status(400).send("Uh-oh! URL does not exist!!!");
  }

  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user_id: req.session.user_id
  };

  res.render("urls_show", templateVars);
});

// register page
app.get("/register", (req,res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  }

  const templateVars = {
    user_id: req.session.user_id
  };

  res.render("register", templateVars);
});

app.get("/login", (req,res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  }

  const templateVars = {
    user_id: req.session.user_id
  };
  res.render("login", templateVars);
});

// ------------------- POST -------------------------

// for creating a new URL
app.post("/urls", (req, res) => { 
  if (!req.session.user_id) {
    res.send("Uh-oh! You are not logged in.");

  } else {

    let shortURL = generateRandomString(6);
  
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id.id
    };

    res.redirect("urls/");

  }
});

// deleting url
app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.session.user_id) {
    res.send("Uh-oh! You can't delete that.");
  
  } else {

  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");

  }
});

// for editing the URL
app.post("/urls/:id", (req, res) => {
  //if cookies doesnt exist, throw error
  if (!req.session.user_id) {
    return res.status(400).send("Uh-oh! Please log in.");
  }

  const filteredURLS = urlsForUser(req.session.user_id.id, urlDatabase);
  
  // if for the specific id in filteredURLS does not exist, throw error
  if (!filteredURLS[req.params.id]) {
    return res.status(400).send("Uh-oh! URL does not exist.");
  }

  let id = req.params.id;
  let longURL = req.body.longURL;
  const userID = req.session.user_id.id;
  urlDatabase[id] = {longURL, userID};

  res.redirect(`/urls`);
});

// for logging in
app.post("/login", (req, res) => {
  const inputEmail = req.body.email;
  const inputPassword = req.body.password;
  
  let result = false;
  let currentUser = "";
  // looping through users to check if email and passwords both match
  for (const user in users) {
    if (inputEmail === users[user].email && bcrypt.compareSync(inputPassword, users[user].password)) {
      result = true;
      currentUser = users[user];
      break;
    }
  }
  //if truthy value, proceed to set cookie and redirect to urls page
  //if falsy, throw error
  if (result) {
    req.session.user_id = currentUser;
    res.redirect(`/urls`);
  } else {
    return res.status(403).send("Uh-oh! User doesn't exist!");
  }
});

// for logging out
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/urls`);
});

// for registering
app.post("/register", (req, res) => {
  const RandomUserID = generateRandomString(6);

  // checking if the email and password are empty strings
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("Uh-oh! Please enter a valid email/password!");
  }
  // if the user exists, send a 400 status code
  const duplicateUser = getUserByEmail(req.body.email, users);
  if (duplicateUser) {
    return res.status(400).send("Uh-oh! User already exists!");
  }
  // hashing password
  let plainUserPW = req.body.password;
  let salt = bcrypt.genSaltSync(10);
  let hashedPassword = bcrypt.hashSync(plainUserPW, salt);

  users[RandomUserID] = {
    id: RandomUserID,
    email: req.body.email,
    password: hashedPassword
  };

  req.session.user_id = users[RandomUserID];
  res.redirect("/urls");
});

// --------
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});








