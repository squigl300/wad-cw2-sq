// models/Pantry.js

const nedb = require('nedb');
const path = require('path');

class Pantry {
  constructor(dbFilePath) {
    if (!dbFilePath) {
      throw new Error('Database file path is required');
    }

    this.db = new nedb({ filename: path.resolve(__dirname, '..', 'database', 'pantries.db'), autoload: true });
  }

  // Create a new pantry
  create(pantryData) {
    return new Promise((resolve, reject) => {
      this.db.insert(pantryData, (err, newPantry) => {
        if (err) {
          reject(err);
        } else {
          resolve(newPantry);
        }
      });
    });
  }

  // Find all pantries
  findAll() {
    return new Promise((resolve, reject) => {
      this.db.find({}, (err, pantries) => {
        if (err) {
          reject(err);
        } else {
          resolve(pantries);
        }
      });
    });
  }

  // Find a pantry by ID
  findById(pantryId) {
    return new Promise((resolve, reject) => {
      this.db.findOne({ _id: pantryId }, (err, pantry) => {
        if (err) {
          reject(err);
        } else {
          resolve(pantry);
        }
      });
    });
  }
}

module.exports = Pantry;