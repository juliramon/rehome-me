const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    require: [true, 'Username is required'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    require: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email address']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required']
  },
  avatar: {
    type: String,
    match: [/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm, 'Invalid URL']
  },
  description: String,
  sitter: Boolean
});

const User = mongoose.model('User', userSchema);
module.exports = User;