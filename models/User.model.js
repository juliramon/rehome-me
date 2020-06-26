const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  fullName: {
      type: String,
      require: [true, 'Name and lastname are required']
  },
  username: {
    type: String,
    // require: [true, 'Username is required'],
    default: 'notset',
    // unique: true,
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
    type: String
    // required: [true, 'Password is required']
  },
  avatar: {
    type: String,
    default: 'https://res.cloudinary.com/agustems/image/upload/v1592843963/rehome-me/empty-avatar.svg.svg'
    // match: [/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm, 'Invalid URL']
  },
  googleId: String,
  description: String,
  sitter: {
    type: Boolean,
    default: 'false'
  }
});

const User = mongoose.model('User', userSchema);
module.exports = User;