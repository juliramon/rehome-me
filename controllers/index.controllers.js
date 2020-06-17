const {
  Mongoose
} = require('mongoose');
const Animal = require('../models/Animal.model');

const getFeaturedAnimals = (req, res, next) => {
  //Animal.find().limit(6)
  res.render('index')
}

module.exports = {
  getFeaturedAnimals
}