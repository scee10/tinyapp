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
 b6UTxQ: {
     longURL: "https://www.tsn.ca",
     userID: "aJ48lW"
 },
 i3BoGr: {
     longURL: "https://www.google.ca",
     userID: "aJ48lW"
 }
};

const users = { 
 "userRandomID": {
   id: "userRandomID", 
   email: "user@example.com", 
   password: "123"
 },
"user2RandomID": {
   id: "user2RandomID", 
   email: "user2@example.com", 
   password: "456"
 }
};


// -------- HELPER FUNCTIONS -------
function generateRandomString() {
 let r = (Math.random() + 1).toString(36).substring(6);
 return r;
};


// need to compare the LOGGED IN users ID with the userID from database
const urlsForUser = function (id, urlDatabase) {
 const userURL = {}
 for (key in urlDatabase) {
  // console.log("This is database userID", urlDatabase[key].userID)
  // console.log("This is database URL", urlDatabase[key].longURL)
 if (id === urlDatabase[key].userID) {
   userURL[key] = urlDatabase[key];
  }
 }
 console.log(userURL)
 return userURL;
};


// ------- GET ----------

app.get("/", (req, res) => { // CHANGED IN URLS_INDEX
  if(!req.cookies.user_id) {
   return res.redirect("/login")
  } 
  res.redirect("/urls")
});

app.get("/urls", (req, res) => { // CHANGED IN URLS_INDEX

  if(!req.cookies.user_id) {
   return res.send("Uh-oh! Please log in or register!");
  };

  const filteredURLS = urlsForUser(req.cookies.user_id.id, urlDatabase)

  const templateVars = { 
   urls: filteredURLS, 
   user_id: req.cookies.user_id
  };

// console.log(urlsForUser(req.cookies.user_id.id, urlDatabase));

  res.render("urls_index", templateVars);

});

app.get("/u/:shortURL", (req, res) => { // CHANGED
  if (!urlDatabase[req.params.shortURL]) {
   res.send("Uh-oh! URL no longer exist!")
  } 
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => { 
  const templateVars = { 
   user_id: req.cookies.user_id
  };

  if (req.cookies.user_id) {
   return res.render("urls_new", templateVars);
  } else {
   res.redirect("/login");
  };

});

app.get("/urls/:shortURL", (req, res) => { //CHANGED LONGURL
 const filteredURLS = urlsForUser(req.cookies.user_id.id, urlDatabase);

  // if for the specific id in filteredURLS does not exist, throw error
  if (!filteredURLS[req.params.shortURL]) {
   return res.status(400).send("Uh-oh! URL does not exist!")
  };

  const templateVars = { 
   shortURL: req.params.shortURL, 
   longURL: urlDatabase[req.params.shortURL].longURL,
   user_id: req.cookies.user_id
  };
  console.log(templateVars)
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

// for creating a new URL
app.post("/urls", (req, res) => { // CHANGED
  if (!req.cookies.user_id) {
   res.send("Uh-oh! You are not logged in.")

  } else {

  let shortURL = generateRandomString();
  
  urlDatabase[shortURL] = {
   longURL: req.body.longURL,
   userID: req.cookies.user_id.id
  };

  res.redirect("urls/");    

  };   

  console.log("THIS IS THE DATABASE:", urlDatabase)
});


app.post("/urls/:shortURL/delete", (req, res) => {

  // 162 - 172 should be copied and pasted here 
  // 
 delete urlDatabase[req.params.shortURL];
 res.redirect("/urls");
 });

 // for editing the URL
 app.post("/urls/:id", (req, res) => { // CHANGED ********

  // NEED TO FIX: this is still sending me to the edit page when it should send me an error msg
  
  //if cookies doesnt exist, throw error
  if (!req.cookies.user_id) {
   res.status(400).send("Uh-oh! Please log in.")
  };

  const filteredURLS = urlsForUser(req.cookies.user_id.id, urlDatabase);

  // if for the specific id in filteredURLS does not exist, throw error
  if (!filteredURLS[req.params.shortURL]) {
   return res.status(400).send("Uh-oh! URL does not exist.")
  };

 // -----

  let id = req.params.id;
  let longURL = req.body.longURL;
  const userID = req.cookies.user_id
  urlDatabase[id] = {longURL, userID};

  res.redirect(`/urls`);
});


app.post("/login", (req, res) => { 

 // NEED TO TAKE A LOOK AT THIS AGAIN 

 const inputEmail = req.body.email
 const inputPassword = req.body.password

  console.log(users)
  
  let result = false;
  let currentUser = ""

  for (const user in users) {
   if (inputEmail === users[user].email && inputPassword === users[user].password) {
    result = true;
    currentUser = users[user];
    break;
   } 
  }
  if (result) {
     res.cookie('user_id', currentUser);
     res.redirect(`/urls`);
  } else {
   return res.status(403).send("Uh-oh! User doesn't exist!");
  }
});


app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect(`/login`);
});


app.post("/register", (req, res) => {

  // CHECK THIS TOO (DATABASE ISSUE?)

  const RandomUserID = generateRandomString();

  // checking if the email and password are empty strings
  if (req.body.email === "" || req.body.password === "") {
   return res.status(400).send("Uh-oh! Please enter a valid email/password!")
  } 
  // if the user exists, send a 400 status code 
  const duplicateUser = findUser(req.body.email, users)
  if (duplicateUser) {
   return res.status(400).send("Uh-oh! User already exists!")
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

