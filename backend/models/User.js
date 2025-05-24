const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: false, // Username is not required at registration
    unique: true,
    sparse: true, // Allows multiple documents to have null for username, but unique if not null
    trim: true,
    minlength: 3 // Optional: enforce a minimum length for usernames
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address']
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
  // resetPasswordToken and resetPasswordExpires are no longer needed for the simplified flow
  // resetPasswordToken: {
  //   type: String,
  //   required: false
  // },
  // resetPasswordExpires: {
  //   type: Date,
  //   required: false
  // }
});

module.exports = mongoose.model('User', UserSchema);
