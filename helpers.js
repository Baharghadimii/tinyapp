//helper functions
const generateRandomString = function(length) {

  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;

};

const getUserByEmail = function(email, database) {
  // lookup magic...
  for (const user in database) {
    if (database[user]['username'] === email) {
      return database[user];
    }
  }

};
//helper function that returns url list of given ID
const urldForUsers = function(id, database) {
  const temp = {};
  for (const url in database) {
    if (database[url]['userId'] === id) {
      temp[url] = database[url];
    }

  }
  return temp;
};
const isNewUrl = function(url, database) {

  for (const id in database) {
    if (database[id].longURL === url) {
      return false;
    }
  }
  return true;

};

module.exports = {
  generateRandomString,
  getUserByEmail,
  urldForUsers,
  isNewUrl
};