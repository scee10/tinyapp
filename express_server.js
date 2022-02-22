const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

const urlDatabase = {
 "b2xVn2": "http://www.lighthouselabs.ca",
 "9sm5xK": "http://www.google.com"
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

function generateRandomString() {
 let r = (Math.random() + 1).toString(36).substring(6);
 return r;
};

app.post("/urls", (req, res) => {
 // console.log(req.body);  // Log the POST request body to the console
 let shortURL = generateRandomString()
 let longURL = req.body.longURL
 urlDatabase[shortURL] = longURL
 // console.log(urlDatabase)
 // console.log(longURL)
 // console.log(shortURL)
 res.redirect(`urls/`);        
});

app.post("/urls/:shortURL/delete", (req, res) => {
 // console.log("Trying to delete", req.params.shortURL)
delete urlDatabase[req.params.shortURL]
res.redirect("/urls")
});

app.post("/urls/:id", (req, res) => {
 console.log(req)
 let id = req.params.id
 let longURL = req.body.longURL
 urlDatabase[id] = longURL
 res.redirect(`/urls`);
});

app.get("/urls", (req, res) => {
 const templateVars = { urls: urlDatabase };
 res.render("urls_index", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
 const longURL = urlDatabase[req.params.shortURL];
 // console.log("LongURL:", longURL)
 res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
 res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
 const templateVars = { 
  shortURL: req.params.shortURL, 
  longURL: urlDatabase[req.params.shortURL] 
 };
 res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
 console.log(`Example app listening on port ${PORT}!`);
});