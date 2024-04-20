// models/Item.js

const nedb = require('nedb');
const path = require('path');

class Item {
  constructor(dbFilePath) {
    if (!dbFilePath) {
      throw new Error('Database file path is required');
    }

    this.db = new nedb({ filename: path.resolve(__dirname, '..', 'database', 'items.db'), autoload: true });
  }

   /**
   * Create a new item
   * @param {Object} itemData - The item data to be created
   * @returns {Promise} - A promise that resolves to the newly created item
   */
   create(itemData) {
    return new Promise((resolve, reject) => {
      this.db.insert({ ...itemData, createdAt: new Date() }, (err, newItem) => {
        if (err) {
          reject(err);
        } else {
          resolve(newItem);
        }
      });
    });
  }

  // Find all available items
  findAllAvailable() {
    return new Promise((resolve, reject) => {
      const currentDate = new Date();
      this.db.find({ status: 'available', useByDate: { $gte: currentDate } }, (err, items) => {
        if (err) {
          reject(err);
        } else {
          resolve(items);
        }
      });
    });
  }

  // Mark an item as selected by a pantry
  markAsSelected(itemId, pantryId) {
    return new Promise((resolve, reject) => {
      this.db.update(
        { _id: itemId },
        { $set: { status: 'selected', pantryId } },
        {},
        (err, numUpdated) => {
          if (err) {
            reject(err);
          } else {
            resolve(numUpdated);
          }
        }
      );
    });
  }

  // Find an item by ID
  findById(itemId) {
    return new Promise((resolve, reject) => {
      this.db.findOne({ _id: itemId }, (err, item) => {
        if (err) {
          reject(err);
        } else {
          resolve(item);
        }
      });
    });
  }

  // Update an item
  update(itemId, updateData) {
    return new Promise((resolve, reject) => {
      this.db.update({ _id: itemId }, { $set: updateData }, {}, (err, numUpdated) => {
        if (err) {
          reject(err);
        } else {
          resolve(numUpdated);
        }
      });
    });
  }

  // Find items by donor ID
findByDonorId(donorId) {
    return new Promise((resolve, reject) => {
      this.db.find({ donorId }, (err, items) => {
        if (err) {
          reject(err);
        } else {
          resolve(items);
        }
      });
    });
  }
  
  // Find items by pantry ID
  findByPantryId(pantryId) {
    return new Promise((resolve, reject) => {
      this.db.find({ pantryId }, (err, items) => {
        if (err) {
          reject(err);
        } else {
          resolve(items);
        }
      });
    });
  }

  // Delete an item
delete(itemId) {
    return new Promise((resolve, reject) => {
      this.db.remove({ _id: itemId }, {}, (err, numRemoved) => {
        if (err) {
          reject(err);
        } else {
          resolve(numRemoved);
        }
      });
    });
  }

  // Search items
searchItems(query) {
    return new Promise((resolve, reject) => {
      const regex = new RegExp(query, 'i');
      this.db.find({ $or: [{ name: regex }, { description: regex }] }, (err, items) => {
        if (err) {
          reject(err);
        } else {
          resolve(items);
        }
      });
    });
  }

  // Find all available items with pagination
findAllAvailable(page, limit) {
  return new Promise((resolve, reject) => {
    const currentDate = new Date();
    const skip = (page - 1) * limit;
    this.db.find({ status: 'available', useByDate: { $gte: currentDate } })
      .skip(skip)
      .limit(limit)
      .exec((err, items) => {
        if (err) {
          reject(err);
        } else {
          resolve(items);
        }
      });
  });
}
  
  // Count all available items
  countAllAvailable() {
    return new Promise((resolve, reject) => {
      this.db.count({ status: 'available' }, (err, count) => {
        if (err) {
          reject(err);
        } else {
          resolve(count);
        }
      });
    });
  }

}



module.exports = Item;