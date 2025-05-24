const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  async (req, res) => {
    console.log('[REGISTER] Received registration request:', req.body.email);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('[REGISTER] Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      console.log(`[REGISTER] Checking if user ${email} exists...`);
      let user = await User.findOne({ email });

      if (user) {
        console.log(`[REGISTER] User ${email} already exists.`);
        return res.status(400).json({ msg: 'User already exists' });
      }
      console.log(`[REGISTER] User ${email} does not exist. Creating new user...`);

      user = new User({
        email,
        password
      });

      console.log(`[REGISTER] Generating salt for ${email}...`);
      const salt = await bcrypt.genSalt(10);
      console.log(`[REGISTER] Hashing password for ${email}...`);
      user.password = await bcrypt.hash(password, salt);

      console.log(`[REGISTER] Saving user ${email} to database...`);
      await user.save();
      console.log(`[REGISTER] User ${email} saved successfully. User ID: ${user.id}`);

      const payload = {
        user: {
          id: user.id
        }
      };

      console.log(`[REGISTER] Signing JWT for user ID ${user.id}...`);
      jwt.sign(
        payload,
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: 360000 },
        (err, token) => {
          if (err) {
            console.error('[REGISTER] JWT Sign Error:', err);
            // Explicitly throw to be caught by the outer catch block
            throw err; 
          }
          console.log(`[REGISTER] JWT signed successfully for user ID ${user.id}.`);
          res.json({ token });
        }
      );

    } catch (err) {
      console.error('[REGISTER] Server error during registration process:', err.message, err.stack);
      res.status(500).send('Server error from registration catch block');
    }
  }
);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ msg: 'Invalid Credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid Credentials' });
      }

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET || 'your_jwt_secret', // Use an environment variable for the secret in production
        { expiresIn: 360000 }, // Optional: token expiration
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
