// utils/tokenGenerator.js

const crypto = require('crypto');

function generateVerificationToken() {
  return crypto.randomBytes(20).toString('hex');
}

function generateResetToken() {
  return crypto.randomBytes(20).toString('hex');
}

module.exports = {
  generateVerificationToken,
  generateResetToken
};