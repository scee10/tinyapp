const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')
app.set("view engine", "ejs");
app.use(cookieParser())

const urlDatabase = {
 "b2xVn2": "http://www.lighthouselabs.ca",
 "9sm5xK": "http://www.google.com"
};

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

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

function generateRandomString() {
 let r = (Math.random() + 1).toString(36).substring(6);
 return r;
};

app.post("/register", (req, res) => {
 const RandomUserID = generateRandomString();
 users[RandomUserID] = {
   id: RandomUserID,
   email: req.body.email,
   password: req.body.password
 }
 console.log(users);
 console.log(req.body.email, req.body.password)
 res.cookie('user_id', users[RandomUserID]);
 res.redirect("/urls");
});

app.post("/urls", (req, res) => {
 let shortURL = generateRandomString();
 let longURL = req.body.longURL;
 urlDatabase[shortURL] = longURL;
 res.redirect("urls/");        
});

app.post("/urls/:shortURL/delete", (req, res) => {
delete urlDatabase[req.params.shortURL];
res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
 console.log(req)
 let id = req.params.id;
 let longURL = req.body.longURL;
 urlDatabase[id] = longURL;
 res.redirect(`/urls`);
});

app.post("/login", (req, res) => {
 res.cookie('username', req.body.username);
 res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
 res.clearCookie('username');
 res.redirect(`/urls`);
});

app.get("/urls", (req, res) => {
 const templateVars = { 
  urls: urlDatabase, 
  username: req.cookies["username"]
 };
 res.render("urls_index", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
 const longURL = urlDatabase[req.params.shortURL];
 res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
 const templateVars = { 
  username: req.cookies["username"]
 };
 res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
 const templateVars = { 
  shortURL: req.params.shortURL, 
  longURL: urlDatabase[req.params.shortURL],
  username: req.cookies["username"] 
 };
 res.render("urls_show", templateVars);
});

app.get("/register", (req,res) => {
 const templateVars = { 
  username: req.cookies["username"]
 };
 res.render("register", templateVars)
})

app.listen(PORT, () => {
 console.log(`Example app listening on port ${PORT}!`);
});