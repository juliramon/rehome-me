const mongoose = require('mongoose');
const Animal = require('../models/Animal.model');

const getIndex = (req, res, next) => res.render('index')

const getUserProfile = async (req, res) => {
  try {
    const userAnimals = await Animal.find({owner: req.session.currentUser._id});
    console.log(userAnimals)
    res.render('user-profile', {userInSession: req.session.currentUser, userAnimals})
  } catch (error) {
    console.log(error)
  }
}

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

const getAnimalsList = async (req, res, next) => {
  const animals = await Animal.find();
  res.render('animals', {animals})
}

module.exports = {
  getIndex,
  getUserProfile,
  getAnimalForm,
  createNewAnimal,
  getAnimalsList
}