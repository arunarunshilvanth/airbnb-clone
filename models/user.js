const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'firstName is Required']
  },

  lastName: String,

  email: {
    type: String,
    required: [true, 'Email is Required'],
    unique: true
  },

  password: {
    type: String,
    required: [true, 'Password is required']
  },

  userType: {
    type: String,
    enum: ['guest', 'host'],
    default: 'guest'
  },

  favourites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Home'
    }
  ]
});

module.exports = mongoose.model('User', userSchema);
