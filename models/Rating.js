// models/Rating.js

const nedb = require('nedb');
const path = require('path');

class Rating {
  constructor(dbFilePath) {
    if (!dbFilePath) {
      throw new Error('Database file path is required');
    }

    this.db = new nedb({ filename: path.resolve(__dirname, '..', 'database', 'ratings.db'), autoload: true });
  }

  /**
   * Create a new rating
   * @param {Object} ratingData - The rating data to be created
   * @returns {Promise} - A promise that resolves to the newly created rating
   */
  create(ratingData) {
    return new Promise((resolve, reject) => {
      this.db.insert(ratingData, (err, newRating) => {
        if (err) {
          reject(err);
        } else {
          resolve(newRating);
        }
      });
    });
  }

  /**
   * Find ratings by item ID
   * @param {string} itemId - The item ID to find ratings for
   * @returns {Promise} - A promise that resolves to an array of ratings
   */
  findByItemId(itemId) {
    return new Promise((resolve, reject) => {
      this.db.find({ itemId }, (err, ratings) => {
        if (err) {
          reject(err);
        } else {
          resolve(ratings);
        }
      });
    });
  }
}

module.exports = Rating;