const generateRandomString = function () {
 let r = (Math.random() + 1).toString(36).substring(6);
 return r;
};

// need to compare the LOGGED IN users ID with the userID from database
const urlsForUser = function (id, urlDatabase) {
 const userURL = {}
 for (key in urlDatabase) {
 if (id === urlDatabase[key].userID) {
   userURL[key] = urlDatabase[key];
  }
 }
 return userURL;
};

const getUserByEmail = function (email, users) {
 for (const user in users) {
  if (email === users[user].email) {
   return users[user];
  }
 }
 return undefined
};

module.exports = {generateRandomString, urlsForUser, getUserByEmail}

