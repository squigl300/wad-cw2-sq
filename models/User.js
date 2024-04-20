// models/User.js

const nedb = require('nedb');
const bcrypt = require('bcrypt');
const path = require('path');

class User {
    constructor(dbFilePath) {
      if (!dbFilePath) {
        throw new Error('Database file path is required');
      }
  
      this.db = new nedb({ filename: path.resolve(__dirname, '..', 'database', 'users.db'), autoload: true });
    }

  // Create a new user
  async create(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = { ...userData, password: hashedPassword };
    return new Promise((resolve, reject) => {
      this.db.insert(user, (err, newUser) => {
        if (err) {
          reject(err);
        } else {
          resolve(newUser);
        }
      });
    });
  }

  // Find a user by email
  findByEmail(email) {
    return new Promise((resolve, reject) => {
      this.db.findOne({ email }, (err, user) => {
        if (err) {
          reject(err);
        } else {
          resolve(user);
        }
      });
    });
  }

  // Find a user by ID
  findById(userId) {
    return new Promise((resolve, reject) => {
      this.db.findOne({ _id: userId }, (err, user) => {
        if (err) {
          reject(err);
        } else {
          resolve(user);
        }
      });
    });
  }

 // Delete a user
 delete(userId) {
  return new Promise((resolve, reject) => {
    this.db.remove({ _id: userId }, {}, (err, numRemoved) => {
      if (err) {
        reject(err);
      } else {
        resolve(numRemoved);
      }
    });
  });
}

  // Update the user's reset token
updateResetToken(userId, resetToken) {
    return new Promise((resolve, reject) => {
      this.db.update({ _id: userId }, { $set: { resetToken } }, {}, (err, numUpdated) => {
        if (err) {
          reject(err);
        } else {
          resolve(numUpdated);
        }
      });
    });
  }
  
  // Find a user by reset token
  findByResetToken(resetToken) {
    return new Promise((resolve, reject) => {
      this.db.findOne({ resetToken }, (err, user) => {
        if (err) {
          reject(err);
        } else {
          resolve(user);
        }
      });
    });
  }
  
  // Update the user's password
  updatePassword(userId, newPassword) {
    return new Promise((resolve, reject) => {
      this.db.update({ _id: userId }, { $set: { password: newPassword } }, {}, (err, numUpdated) => {
        if (err) {
          reject(err);
        } else {
          resolve(numUpdated);
        }
      });
    });
  }
  
  // Remove the user's reset token
  removeResetToken(userId) {
    return new Promise((resolve, reject) => {
      this.db.update({ _id: userId }, { $unset: { resetToken: 1 } }, {}, (err, numUpdated) => {
        if (err) {
          reject(err);
        } else {
          resolve(numUpdated);
        }
      });
    });
  }

  // Find a user by verification token
findByVerificationToken(verificationToken) {
  return new Promise((resolve, reject) => {
    this.db.findOne({ verificationToken }, (err, user) => {
      if (err) {
        reject(err);
      } else {
        resolve(user);
      }
    });
  });
}

// Mark user's email as verified
markEmailAsVerified(userId) {
  return new Promise((resolve, reject) => {
    this.db.update({ _id: userId }, { $set: { emailVerified: true }, $unset: { verificationToken: 1 } }, {}, (err, numUpdated) => {
      if (err) {
        reject(err);
      } else {
        resolve(numUpdated);
      }
    });
  });
}

// Update the user's reset token
updateResetToken(userId, resetToken) {
  return new Promise((resolve, reject) => {
    this.db.update({ _id: userId }, { $set: { resetToken } }, {}, (err, numUpdated) => {
      if (err) {
        reject(err);
      } else {
        resolve(numUpdated);
      }
    });
  });
}

// Find a user by reset token
findByResetToken(resetToken) {
  return new Promise((resolve, reject) => {
    this.db.findOne({ resetToken }, (err, user) => {
      if (err) {
        reject(err);
      } else {
        resolve(user);
      }
    });
  });
}

// Update the user's password
updatePassword(userId, newPassword) {
  return new Promise((resolve, reject) => {
    this.db.update({ _id: userId }, { $set: { password: newPassword } }, {}, (err, numUpdated) => {
      if (err) {
        reject(err);
      } else {
        resolve(numUpdated);
      }
    });
  });
}

// Remove the user's reset token
removeResetToken(userId) {
  return new Promise((resolve, reject) => {
    this.db.update({ _id: userId }, { $unset: { resetToken: 1 } }, {}, (err, numUpdated) => {
      if (err) {
        reject(err);
      } else {
        resolve(numUpdated);
      }
    });
  });
}
}

module.exports = User;