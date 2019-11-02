/* eslint-disable no-trailing-spaces */
const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    username: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    username: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function () {
  it('should return a user with valid email', function () {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert.equal(user, expectedOutput);
  });
});
describe('getUserByEmail', function () {
  it('should return undefined if the user is not in database', function () {
    const user = getUserByEmail("something@somthing.com", testUsers);
    const expectedOutput = undefined;
    // Write your assert statement here
    assert.equal(user, expectedOutput);
  });
});