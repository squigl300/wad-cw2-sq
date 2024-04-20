// routes/userRoutes.js

const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { validateRegistration } = require('../middleware/validationMiddleware');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { sendVerificationEmail, sendResetEmail } = require('../utils/emailService');
const { generateVerificationToken, generateResetToken } = require('../utils/tokenGenerator');
const { body, validationResult } = require('express-validator');


const router = express.Router();

// Create a new User instance with the database file path
const userModel = new User('database/users.db');

/**
 * User registration route
 * Validates the registration input using the validateRegistration middleware
 */
router.post('/register',
[
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
  body('password').trim().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
], 
validateRegistration, async (req, res) => {
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      req.flash('error_msg', 'User already exists');
      return res.redirect('/register');
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate email verification token
    const verificationToken = generateVerificationToken();
    
    // Create a new user
    const newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
      role,
      verificationToken
    });
    
    // Send email verification link
    await sendVerificationEmail(newUser.email, verificationToken);
    
    req.flash('success_msg', 'User registered successfully. Please check your email for verification.');
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to register user. Please try again later.');
    res.redirect('/register');
  }
});

// User login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      // Create a session for the user
      req.session.userId = user._id;
      req.session.role = user.role;
      res.json({ message: 'Login successful' });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to login' });
  }
});

// User logout route
router.post('/logout', (req, res) => {
  // Destroy the user session
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: 'Failed to logout' });
    } else {
      res.json({ message: 'Logout successful' });
    }
  });
});

// Render the user's profile
router.get('/profile', async (req, res) => {
    try {
      const userId = req.session.userId;
      const user = await userModel.findById(userId);
      if (user) {
        let itemsAvailable = [];
        let itemsClaimed = [];
        if (user.role === 'donor') {
          itemsAvailable = await itemModel.findByDonorId(userId);
        } else if (user.role === 'pantry') {
          itemsClaimed = await itemModel.findByPantryId(userId);
        }
        res.render('profile', { title: 'User Profile', user, itemsAvailable, itemsClaimed });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve user profile' });
    }
  });

// Render the user profile edit form
router.get('/profile/edit', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await userModel.findById(userId);
    if (user) {
      res.render('editProfile', { title: 'Edit Profile', user });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve user profile' });
  }
});

  // Handle user profile update form submission
router.post('/profile/edit', isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { name, email } = req.body;
  
      // Validate and sanitize form data
      const sanitizedName = sanitize(name);
      const sanitizedEmail = sanitize(email);
  
      // Validate form data
      if (!sanitizedName || !sanitizedEmail) {
        return res.status(400).json({ error: 'Please fill in all fields' });
      }
  
      const updateData = {
        name: sanitizedName,
        email: sanitizedEmail
      };
  
      const updatedUser = await userModel.update(userId, updateData);
      if (updatedUser) {
        res.redirect('/profile');
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Failed to update user profile' });
    }
  });

  // Render the password reset request form
router.get('/forgot-password', (req, res) => {
    res.render('forgotPassword', { title: 'Forgot Password' });
  });
  
  // Handle password reset request form submission
  router.post('/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
  
      // Validate and sanitize form data
      const sanitizedEmail = sanitize(email);
  
      // Validate form data
      if (!sanitizedEmail) {
        return res.status(400).json({ error: 'Please provide an email address' });
      }
  
      const user = await userModel.findByEmail(sanitizedEmail);
      if (user) {
        // Generate and store password reset token
        const resetToken = generateResetToken();
        await userModel.updateResetToken(user._id, resetToken);
  
        // Send password reset email
        await sendResetEmail(user.email, resetToken);
  
        res.render('resetEmailSent', { title: 'Reset Email Sent' });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Failed to process password reset request' });
    }
  });
  
  // Render the password reset form
  router.get('/reset-password/:token', async (req, res) => {
    try {
      const resetToken = req.params.token;
      const user = await userModel.findByResetToken(resetToken);
      if (user) {
        res.render('resetPassword', { title: 'Reset Password', token: resetToken });
      } else {
        res.status(400).json({ error: 'Invalid or expired reset token' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Failed to process password reset' });
    }
  });
  
  // Handle password reset form submission
  router.post('/reset-password/:token', async (req, res) => {
    try {
      const resetToken = req.params.token;
      const { password } = req.body;
  
      // Validate and sanitize form data
      const sanitizedPassword = sanitize(password);
  
      // Validate form data
      if (!sanitizedPassword) {
        return res.status(400).json({ error: 'Please provide a new password' });
      }
  
      const user = await userModel.findByResetToken(resetToken);
      if (user) {
        // Hash the new password
        const hashedPassword = await bcrypt.hash(sanitizedPassword, 10);
  
        // Update the user's password and remove the reset token
        await userModel.updatePassword(user._id, hashedPassword);
        await userModel.removeResetToken(user._id);
  
        res.redirect('/login');
      } else {
        res.status(400).json({ error: 'Invalid or expired reset token' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Failed to process password reset' });
    }
  });

// Password reset request route
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findByEmail(email);
    if (user) {
      // Generate and store password reset token
      const resetToken = generateResetToken();
      await userModel.updateResetToken(user._id, resetToken);

      // Send password reset email
      await sendResetEmail(user.email, resetToken);

      res.render('resetEmailSent', { title: 'Reset Email Sent' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

// Password reset route
router.post('/reset-password/:token', async (req, res) => {
  try {
    const resetToken = req.params.token;
    const { password } = req.body;
    const user = await userModel.findByResetToken(resetToken);
    if (user) {
      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update the user's password and remove the reset token
      await userModel.updatePassword(user._id, hashedPassword);
      await userModel.removeResetToken(user._id);

      res.redirect('/login');
    } else {
      res.status(400).json({ error: 'Invalid or expired reset token' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to process password reset' });
  }
});


module.exports = router;