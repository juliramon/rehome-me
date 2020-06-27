const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const animalSchema = new Schema({
  name: {
    type: String,
    required: [true, `The pet's name is required`],
    trim: true
  },
  category: {
    type: String,
    required: [true, `The pet's category is required`],
    enum: ['dog', 'cat', 'bird', 'snake', 'rabbit']
  },
  image: String,
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
  checkout: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    required: true,
  },
  careRoutine: String,
  specialNeeds: Boolean,
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  type: {
    type: String,
    enum: ['adoption', 'sitting'],
    required: true
  },
  adopted: {
    type: String,
    enum: ['adopted', 'not-adopted', 'solicited']
  }
});

const Animal = mongoose.model('Animal', animalSchema);
module.exports = Animal;