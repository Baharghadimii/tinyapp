//helper functions
const generateRandomString = function (length) {

  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;

};

const getUserByEmail = function (email, database) {
  // lookup magic...
  for (const user in database) {
    if (database[user]['email'] === email) {
      return user;
    }
  }

};

module.exports = {
  generateRandomString,
  getUserByEmail
};