// routes/adminRoutes.js

const express = require('express');
const User = require('../models/User');
const Item = require('../models/item');
const { isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

const userModel = new User('database/users.db');
const itemModel = new Item('database/items.db');

// Add routes for administrators to add and delete users and items
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const userData = { name, email, password, role };
    const newUser = await userModel.create(userData);
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.get('/dashboard', isAdmin, async (req, res) => {
  try {
    const users = await userModel.findAll();
    const items = await itemModel.findAll();
    res.render('adminDashboard', { users, items });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

router.delete('/users/:id', isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    await userModel.deleteUser(userId);
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

router.delete('/items/:id', isAdmin, async (req, res) => {
  try {
    const itemId = req.params.id;
    await itemModel.deleteItem(itemId);
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;