const mongoose = require('mongoose');
const Animal = require('../models/Animal.model');

const getIndex = (req, res, next) => res.render('index')

const getUserProfile = (req, res) => res.render('user-profile')

const getAnimalForm = (req, res) => res.render('add-animal')

const createNewAnimal = async (req, res, next) => {
  try {
    const {
      name,
      category,
      image,
      size,
      checkin,
      checkout,
      description,
      careRoutine,
      specialNeeds
    } = req.body;

    console.log(req.body);
    const hasEmptyCredentials = !name || !category || !size || !checkin || !checkout || !description;
    if (hasEmptyCredentials) {
      return res.render('add-animal', {
        errorMessage: 'Please fill all the required fields'
      });
    };

    const booleanCheck = specialNeeds ? true : false;

    const addAnimal = await Animal.create({
      name,
      category,
      image,
      size,
      checkin,
      checkout,
      description,
      careRoutine,
      specialNeeds: booleanCheck,
      owner: req.session.currentUser._id
    })
    res.redirect('/user-profile');
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).render('add-animal', {
        errorMessage: error.message
      });
    } else if (error.code === 11000) {
      res.status(400).render('add-animal', {
        errorMessage: 'This animal has already been registered'
      });
    } else {
      next(error)
    }
  }
};

module.exports = {
  getIndex,
  getUserProfile,
  getAnimalForm,
  createNewAnimal
}