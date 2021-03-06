const generateRandomString = function(length) {
  let r = (Math.random() + 1).toString(36).substring(length);
  return r;
};

// need to compare the LOGGED IN users ID with the userID from database
const urlsForUser = function(id, urlDatabase) {
  const userURL = {};
  for (let key in urlDatabase) {
    if (id === urlDatabase[key].userID) {
      userURL[key] = urlDatabase[key];
    }
  }
  return userURL;
};

const getUserByEmail = function(email, users) {
  for (const user in users) {
    if (email === users[user].email) {
      return users[user].id;
    }
  }
};

module.exports = {generateRandomString, urlsForUser, getUserByEmail};

