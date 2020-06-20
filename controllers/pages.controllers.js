const mongoose = require('mongoose');
const uploadCloud = require('../configs/cloudinary.config');
const Animal = require('../models/Animal.model');

const getIndex = async (req, res, next) => {
  try {
    const animals = await Animal.find().limit(6);
    console.log(animals)
    res.render('index', {
      animals: animals
    });
  } catch (error) {
    next(error)
  }
}

const getUserProfile = async (req, res) => {
  try {
    const userAnimals = await Animal.find({
      owner: req.session.currentUser._id
    });
    console.log(userAnimals)
    res.render('user-profile', {
      userInSession: req.session.currentUser,
      userAnimals
    })
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
      size,
      checkin,
      checkout,
      description,
      careRoutine,
      specialNeeds
    } = req.body;

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
      image: req.file.path,
      size,
      checkin,
      checkout,
      description,
      careRoutine,
      specialNeeds: booleanCheck,
      owner: req.session.currentUser._id
    })
    return res.redirect('/user-profile');
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

const getAnimalDetails = async (req, res, next) => {
  try {
    const findAnimal = await Animal.findById(req.params.id);
    res.render('animal-details', findAnimal)
  } catch (error) {
    next(error)
  }
};

const deleteAnimal = async (req, res, next) => {
  const removeAnimal = await Animal.deleteOne({
    _id: req.params.id
  });
  res.redirect('/user-profile')
};

const getAnimalsList = async (req, res, next) => {
  const animals = await Animal.find();
  res.render('animals', {
    animals
  })
}

const getEditAnimalForm = async (req, res, next) => {
  const animal = await Animal.findById(req.params.animalId)
  console.log(animal);
  const formatDate = (model, field) => {
    let year = eval(model + "." + field + "." + 'getFullYear()');
    let month = eval(model + "." + field + "." + 'getMonth()') + 1;
    let date = eval(model + "." + field + "." + 'getDate()');
    month < 10 ? month = `0${month}` : undefined;
    date < 10 ? date = `0${date}` : undefined;
    return year + "-" + month + "-" + date;
  }
  const checkInDate = formatDate('animal', 'checkin');
  const checkOutDate = formatDate('animal', 'checkout');

  const sizes = Animal.schema.path('size').enumValues;
  const objSizes = sizes.map(el => {
    const newEl = {
      name: el
    }
    return newEl;
  })
  
  objSizes.forEach(el => {
    if(el.name === animal.size){
      let index = objSizes.indexOf(el);
      objSizes.splice(index, 1);
    }
  })

  const species = Animal.schema.path('category').enumValues;
  const objSpecies = species.map(el => {
    const newEl = {
      name: el
    }
    return newEl;
  })

  objSpecies.forEach(el => {
    if(el.name === animal.category){
      let index = objSpecies.indexOf(el);
      objSpecies.splice(index, 1);
    }
  })

  res.render('edit-animal', {animal, checkInDate, checkOutDate, objSizes, objSpecies})
};

const editAnimal = async (req, res, next) => {
  console.log('Edit form submitted, values changed=>', req.body)
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

  const booleanCheck = specialNeeds ? true : false;

  const editAnimal = await Animal.findByIdAndUpdate(req.params.animalId, {$set: {name, category, image, size, checkin, checkout, description, careRoutine, specialNeeds: booleanCheck}})
  res.redirect('/user-profile')
}

module.exports = {
  getIndex,
  getUserProfile,
  getAnimalForm,
  createNewAnimal,
  getAnimalDetails,
  deleteAnimal,
  getAnimalsList,
  getEditAnimalForm,
  editAnimal
}