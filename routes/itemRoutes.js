// routes/itemRoutes.js

const express = require('express');
const Item = require('../models/item');
const { isAuthenticated, isDonor, isPantry } = require('../middleware/authMiddleware');
const { validateItemCreation } = require('../middleware/validationMiddleware');
const Rating = require('../models/Rating');
const ratingModel = new Rating('database/ratings.db');
const { sendEmail } = require('../utils/emailService');

const router = express.Router();

// Create a new Item instance with the database file path
const itemModel = new Item('database/items.db');

/**
 * Route to create a new item.
 * Accessible only to authenticated donors.
 * Validates the item creation input using the validateItemCreation middleware.
 */
router.post('/', isAuthenticated, isDonor, validateItemCreation, async (req, res) => {
  try {
    const { name, description, quantity, useByDate, donorId } = req.body;
    const itemData = { name, description, quantity, useByDate, donorId, status: 'available' };
    const newItem = await itemModel.create(itemData);
    await itemModel.create(itemData);
    req.flash('success_msg', 'Item created successfully');
    res.redirect('/items');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to create item. Please try again later.');
    res.redirect('/items/new');
  }
});

// Render the item form for adding a new item
router.get('/new', isAuthenticated, (req, res) => {
    res.render('itemForm', { title: 'Add Item' });
  });

// Get all available items route
router.get('/', async (req, res) => {
  try {
    const items = await itemModel.findAllAvailable();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve items' });
  }
});

// Update item status route
router.put('/:id/claim', async (req, res) => {
  try {
    const itemId = req.params.id;
    const { pantryId } = req.body;
    const updateData = { status: 'claimed', pantryId };
    const numUpdated = await itemModel.update(itemId, updateData);
    if (numUpdated === 1) {
      res.json({ message: 'Item claimed successfully' });
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// Render the item form for adding a new item
router.get('/new', (req, res) => {
    res.render('itemForm', { title: 'Add Item' });
  });
  
  // Render the item form for editing an existing item
  router.get('/:id/edit', async (req, res) => {
    try {
      const itemId = req.params.id;
      const item = await itemModel.findById(itemId);
      if (item) {
        res.render('itemForm', { title: 'Edit Item', item });
      } else {
        res.status(404).json({ error: 'Item not found' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve item' });
    }
  });
  
 // Handle form submission for adding a new item
router.post('/', async (req, res) => {
    try {
      const { name, description, quantity, useByDate } = req.body;
  
      // Validate form data
      if (!name || !description || !quantity || !useByDate) {
        return res.status(400).json({ error: 'Please fill in all fields' });
      }
  
      const donorId = req.session.userId;
      const itemData = { name, description, quantity, useByDate, donorId, status: 'available' };
      const newItem = await itemModel.create(itemData);
      res.redirect('/items');
    } catch (err) {
      res.status(500).json({ error: 'Failed to create item' });
    }
  });
  
  // Handle form submission for updating an existing item
  router.put('/:id', async (req, res) => {
    try {
      const itemId = req.params.id;
      const { name, description, quantity, useByDate } = req.body;
      const updateData = { name, description, quantity, useByDate };
      const updatedItem = await itemModel.update(itemId, updateData);
      if (updatedItem) {
        res.redirect('/items');
      } else {
        res.status(404).json({ error: 'Item not found' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Failed to update item' });
    }
  });

  // Render the list of available items
router.get('/', async (req, res) => {
    try {
      const items = await itemModel.findAllAvailable();
      res.render('items', { title: 'Available Items', items });
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve items' });
    }
  });

  // Search items route
router.get('/search', async (req, res) => {
    try {
      const { query } = req.query;
      const items = await itemModel.searchItems(query);
      res.render('searchResults', { title: 'Search Results', items });
    } catch (err) {
      res.status(500).json({ error: 'Failed to search items' });
    }
  });

  // Get all available items route with pagination
router.get('/', async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const items = await itemModel.findAllAvailable(page, limit);
      const totalItems = await itemModel.countAllAvailable();
      const totalPages = Math.ceil(totalItems / limit);
      res.render('items', { title: 'Available Items', items, currentPage: page, totalPages });
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve items' });
    }
  });

  /**
 * Get all available items with optional category filtering
 */
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let items;

    if (category) {
      items = await itemModel.findByCategory(category);
    } else {
      items = await itemModel.findAllAvailable();
    }

    res.render('items', { title: 'Available Items', items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve items' });
  }
});

 /**
 * Create a new rating for an item
 */
router.post('/:id/ratings', isAuthenticated, async (req, res) => {
  try {
    const itemId = req.params.id;
    const { rating, comment } = req.body;
    const userId = req.session.userId;

    const ratingData = {
      itemId,
      userId,
      rating: parseInt(rating),
      comment,
      createdAt: new Date(),
    };

    await ratingModel.create(ratingData);
    res.redirect(`/items/${itemId}`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
});

 /**
 * Claim an item
 */
router.put('/:id/claim', isAuthenticated, isPantry, async (req, res) => {
  try {
    const itemId = req.params.id;
    const { pantryId } = req.body;
    const updateData = { status: 'claimed', pantryId };
    const numUpdated = await itemModel.update(itemId, updateData);
    if (numUpdated === 1) {
      const item = await itemModel.findById(itemId);
      const donor = await userModel.findById(item.donorId);
      const pantry = await userModel.findById(pantryId);

      // Send notification email to the donor
      const emailSubject = 'Item Claimed';
      const emailText = `Your item "${item.name}" has been claimed by ${pantry.name}.`;
      await sendEmail(donor.email, emailSubject, emailText);

      res.json({ message: 'Item claimed successfully' });
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

module.exports = router;