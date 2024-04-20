// routes/pantryRoutes.js

const express = require('express');
const Pantry = require('../models/pantry');
const router = express.Router();

// Create a new Pantry instance with the database file path
const pantryModel = new Pantry('database/pantries.db');

// Create a new pantry route
router.post('/', async (req, res) => {
  try {
    const { name, address, phone, email } = req.body;
    const pantryData = { name, address, phone, email };
    const newPantry = await pantryModel.create(pantryData);
    res.status(201).json(newPantry);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create pantry' });
  }
});

// Get all pantries route
router.get('/', async (req, res) => {
  try {
    const pantries = await pantryModel.findAll();
    res.json(pantries);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve pantries' });
  }
});

// Render the pantry form for adding a new pantry
router.get('/new', (req, res) => {
    res.render('pantryForm', { title: 'Add Pantry' });
  });
  
  // Render the pantry form for editing an existing pantry
  router.get('/:id/edit', async (req, res) => {
    try {
      const pantryId = req.params.id;
      const pantry = await pantryModel.findById(pantryId);
      if (pantry) {
        res.render('pantryForm', { title: 'Edit Pantry', pantry });
      } else {
        res.status(404).json({ error: 'Pantry not found' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve pantry' });
    }
  });
  
  // Handle form submission for adding a new pantry
  router.post('/', async (req, res) => {
    try {
      const { name, address, phone, email } = req.body;
      const pantryData = { name, address, phone, email };
      const newPantry = await pantryModel.create(pantryData);
      res.redirect('/pantries');
    } catch (err) {
      res.status(500).json({ error: 'Failed to create pantry' });
    }
  });
  
  // Handle form submission for updating an existing pantry
  router.put('/:id', async (req, res) => {
    try {
      const pantryId = req.params.id;
      const { name, address, phone, email } = req.body;
      const updateData = { name, address, phone, email };
      const updatedPantry = await pantryModel.update(pantryId, updateData);
      if (updatedPantry) {
        res.redirect('/pantries');
      } else {
        res.status(404).json({ error: 'Pantry not found' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Failed to update pantry' });
    }
  });

  // Render the list of pantries
router.get('/', async (req, res) => {
    try {
      const pantries = await pantryModel.findAll();
      res.render('pantries', { title: 'Pantries', pantries });
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve pantries' });
    }
  });

module.exports = router;