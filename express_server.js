const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')
app.set("view engine", "ejs");
app.use(cookieParser())

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// ------ DATABASES --------
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

// -------- HELPER FUNCTIONS -------
function generateRandomString() {
 let r = (Math.random() + 1).toString(36).substring(6);
 return r;
};

// ------- GET ----------

app.get("/urls", (req, res) => { 
 const templateVars = { 
  urls: urlDatabase, 
  user_id: req.cookies.user_id
 };
 res.render("urls_index", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
 const longURL = urlDatabase[req.params.shortURL];
 res.redirect(longURL);
});

app.get("/urls/new", (req, res) => { // WORKING ON THIS ONE NOW 
 const templateVars = { 
  user_id: req.cookies.user_id
 };

 if (req.cookies.user_id) {
  return res.render("urls_new", templateVars);
 } else {
  res.redirect("/login");
 };

});

app.get("/urls/:shortURL", (req, res) => { 
 const templateVars = { 
  shortURL: req.params.shortURL, 
  longURL: urlDatabase[req.params.shortURL],
  user_id: req.cookies.user_id
 };
 res.render("urls_show", templateVars);
});

app.get("/register", (req,res) => { 
 const templateVars = { 
  user_id: req.cookies.user_id
 };
 res.render("register", templateVars)
})

app.get("/login", (req,res) => { 
 const templateVars = { 
  user_id: req.cookies.user_id
 };
 res.render("login", templateVars)
})


// ---------- POST -------------

app.post("/urls", (req, res) => {
 if (!req.cookies.user_id) {
  res.send("Error: You are not logged in")
 } else {
 let shortURL = generateRandomString();
 let longURL = req.body.longURL;
 urlDatabase[shortURL] = longURL;
 res.redirect("urls/");    
 };   
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
 const inputEmail = req.body.email
 const inputPassword = req.body.password

 console.log(users)
 
 for (const user in users) {
  //check if the input email does not match the email in our users object
  if (inputEmail !== users[user].email) {
   return res.status(403).send("USER DOESN'T EXIST");
   //check if the input email matches the email in our users object
  } else if (inputEmail === users[user].email) {
   // then now we check if the input password is equal to the password in the users object
   if(inputPassword !== users[user].password) {
    return res.status(403).send("PASSWORD DOES NOT MATCH");
   } else {
    res.cookie('user_id', users[user]);
    res.redirect(`/urls`);
   }
  }
 };
});

app.post("/logout", (req, res) => {
 res.clearCookie('user_id');
 res.redirect(`/login`);
});

app.post("/register", (req, res) => {
 const RandomUserID = generateRandomString();

 // checking if there email and password are empty strings
 if (req.body.email === "" || req.body.password === "") {
  return res.send(400)
 } 
 // if the user exists, send a 400 status code 
 const duplicateUser = findUser(req.body.email, users)
 if (duplicateUser) {
  return res.status(400).send("USER ALREADY EXISTS")
 } 

 users[RandomUserID] = {
  id: RandomUserID,
  email: req.body.email,
  password: req.body.password
}

 res.cookie('user_id', users[RandomUserID]); 
 console.log(users)
 res.redirect("/urls");
});

// --------
app.listen(PORT, () => {
 console.log(`Example app listening on port ${PORT}!`);
});

// ---- HELPER FUNCTIONS

const findUser = function (email, users) {
 for (const user in users) {
  if (email === users[user].email) {
   return users[user];
  }
 }
 return undefined
};

