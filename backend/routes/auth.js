const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  async (req, res) => {
    console.log('[REGISTER] Received registration request for email:', req.body.email);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('[REGISTER] Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body; // Only email and password from body

    try {
      console.log(`[REGISTER] Checking if user with email ${email} exists...`);
      let userByEmail = await User.findOne({ email });

      if (userByEmail) {
        console.log(`[REGISTER] User with email ${email} already exists.`);
        return res.status(400).json({ msg: 'User with this email already exists' });
      }
      
      console.log(`[REGISTER] User with email ${email} does not exist. Creating new user...`);

      // Generate default username from email prefix
      const emailPrefix = email.split('@')[0];
      let defaultUsername = emailPrefix;
      let usernameIsUnique = false;
      let attemptCount = 0;

      // Attempt to find a unique username by appending a number if the default exists
      while (!usernameIsUnique && attemptCount < 10) { // Limit attempts to prevent infinite loops
        const existingUserWithUsername = await User.findOne({ username: defaultUsername });
        if (!existingUserWithUsername) {
          usernameIsUnique = true;
        } else {
          attemptCount++;
          defaultUsername = `${emailPrefix}${attemptCount}`; // Append attempt number
          console.log(`[REGISTER] Default username ${emailPrefix} taken, trying ${defaultUsername}`);
        }
      }

      if (!usernameIsUnique) {
        // This case should be rare if emails are unique and prefixes are somewhat varied.
        // Or if many users have the same email prefix.
        console.error(`[REGISTER] Could not generate a unique username for ${email} after ${attemptCount} attempts.`);
        return res.status(500).json({ msg: 'Could not generate a unique username. Please contact support.'});
      }

      const newUser = new User({
        email,
        password,
        username: defaultUsername // Assign the generated unique username
      });

      console.log(`[REGISTER] Assigning default username: ${defaultUsername} for ${email}`);
      console.log(`[REGISTER] Generating salt for ${email}...`);
      const salt = await bcrypt.genSalt(10);
      console.log(`[REGISTER] Hashing password for ${email}...`);
      newUser.password = await bcrypt.hash(password, salt);

      console.log(`[REGISTER] Saving user ${email} (username: ${defaultUsername}) to database...`);
      await newUser.save();
      console.log(`[REGISTER] User ${email} saved successfully. User ID: ${newUser.id}`);

      const payload = {
        user: {
          id: newUser.id
        }
      };

      console.log(`[REGISTER] Signing JWT for user ID ${newUser.id}...`);
      jwt.sign(
        payload,
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: 360000 },
        (err, token) => {
          if (err) {
            console.error('[REGISTER] JWT Sign Error:', err);
            throw err;
          }
          console.log(`[REGISTER] JWT signed successfully for user ID ${newUser.id}.`);
          res.json({ token });
        }
      );

    } catch (err) {
      console.error('[REGISTER] Server error during registration process:', err.message, err.stack);
      // Check if it's a duplicate key error for username, though the loop should prevent it.
      if (err.code === 11000 && err.keyPattern && err.keyPattern.username) {
        return res.status(400).json({ msg: 'Username generated from email is already taken. This should be rare.' });
      }
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

// @route   GET api/auth/me
// @desc    Get logged-in user details
// @access  Private
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // req.user is set by authMiddleware
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('[GET /me] Server error:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/auth/username
// @desc    Update user's username
// @access  Private
router.put('/username', 
  authMiddleware, 
  [
    check('username', 'Username is required').not().isEmpty(),
    check('username', 'Username must be at least 3 characters long').isLength({ min: 3 }).trim(),
    check('username').custom(async (value, { req }) => {
      const user = await User.findOne({ username: value });
      // If a user is found with this username, it must be the current user, otherwise it's a conflict
      if (user && user.id.toString() !== req.user.id) {
        throw new Error('Username already taken');
      }
      return true;
    })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username } = req.body;

    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id, 
        { username: username }, 
        { new: true } // Return the updated document
      ).select('-password');

      if (!updatedUser) {
        return res.status(404).json({ msg: 'User not found' });
      }
      
      console.log(`[UPDATE USERNAME] User ${req.user.id} updated username to ${username}`);
      res.json(updatedUser);

    } catch (err) {
      console.error('[UPDATE USERNAME] Detailed Server error:', err); // Log the full error object
      if (err.code === 11000) { // Duplicate key error
        return res.status(400).json({ errors: [{ msg: 'Username already taken' }] });
      }
      res.status(500).send('Server Error');
    }
  }
);

// @route   POST api/auth/forgot-password
// @desc    Reset password directly (simplified flow)
// @access  Public
router.post('/forgot-password', [
  check('email', 'Please include a valid email').isEmail(),
  check('newPassword', 'New password must be 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, newPassword } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: 'User with this email not found.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Clear any old reset tokens if they exist (good practice, though not strictly needed for this flow anymore)
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ msg: 'Password has been reset successfully.' });

  } catch (err) {
    console.error('Error in /forgot-password (direct reset) route:', err.message);
    res.status(500).send('Server error during password reset process');
  }
});

module.exports = router;
