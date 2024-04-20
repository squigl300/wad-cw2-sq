// utils/resetToken.js

const crypto = require('crypto');

function generateResetToken() {
  return crypto.randomBytes(20).toString('hex');
}

module.exports = {
  generateResetToken
};