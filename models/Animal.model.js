const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const animalSchema = new Schema({
  name: {
    type: String,
    require: [true, `The pet's name is required`],
    trim: true
  },
  category: {
    type: String,
    require: [true, `The pet's category is required`],
    enum: ['dog', 'cat', 'bird', 'snake', 'rabbit']
  },
  image: {
    type: String,
    unique: true,
    match: [/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm, 'Invalid URL']
  },
  size: {
    type: String,
    required: [true, `The pet's size is required`],
    enum: ['huge', 'large', 'medium', 'small', 'tiny']
  },
  checkin: {
    type: Date,
    required: true,
    default: Date.now
  },
  cheackout: {
    type: Date,
    required: true,
    default: Date.now
  },
  description: {
    type: String,
    required: true,
  },
  careRoutine: {
    type: String
  },
  specialNeeds: {
    type: Boolean
  }
});

const Animal = mongoose.model('Animal', animalSchema);
module.exports = Animal;