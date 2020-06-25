const mongoose = require('mongoose');
const uploadCloud = require('../configs/cloudinary.config');
const Animal = require('../models/Animal.model');
const Adoption = require('../models/Adoption.model');
const {
  formatDate
} = require('../helpers/helpers');

const getIndex = async (req, res, next) => {
  try {
    const animals = await Animal.find({
      adopted: undefined
    }).limit(6);
    res.render('index', {
      animals: animals,
      userInSession: req.session.currentUser
    });
  } catch (error) {
    next(error)
  }
}

const getUserProfile = async (req, res) => {
  try {
    const userAnimals = await Animal.find({
      owner: req.session.currentUser._id,
      adopted: undefined
    })
    const userAnimalsAdopted = await Adoption.find({
      owner: req.session.currentUser._id
    }).populate('animal').populate('host')

    const userAnimalsOwned = await Adoption.find({
      host: req.session.currentUser._id
    }).populate('animal').populate('owner')

    res.render('user-profile', {
      userInSession: req.session.currentUser,
      userAnimals,
      userAnimalsAdopted,
      userAnimalsOwned
    })
  } catch (error) {
    console.log(error)
  }
}

const getAnimalForm = (req, res) => res.render('add-animal', {
  userInSession: req.session.currentUser
})

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
      specialNeeds,
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
      owner: req.session.currentUser._id,
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
    const checkInDate = formatDate(findAnimal, 'checkin');
    const checkOutDate = formatDate(findAnimal, 'checkout');
    res.render('animal-details', {
      findAnimal,
      checkInDate,
      checkOutDate,
      userInSession: req.session.currentUser
    })
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
  const animals = await Animal.find({
    adopted: undefined
  });
  res.render('animals', {
    animals,
    userInSession: req.session.currentUser
  })
}

const getEditAnimalForm = async (req, res, next) => {
  const animal = await Animal.findById(req.params.animalId);
  const checkInDate = formatDate(animal, 'checkin');
  const checkOutDate = formatDate(animal, 'checkout');
  const sizes = Animal.schema.path('size').enumValues;
  const objSizes = sizes.map(el => {
    const newEl = {
      name: el
    }
    return newEl;
  })

  objSizes.forEach(el => {
    if (el.name === animal.size) {
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
    if (el.name === animal.category) {
      let index = objSpecies.indexOf(el);
      objSpecies.splice(index, 1);
    }
  })

  res.render('edit-animal', {
    animal,
    checkInDate,
    checkOutDate,
    objSizes,
    objSpecies,
    userInSession: req.session.currentUser
  })
};

const editAnimal = async (req, res, next) => {
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

  const booleanCheck = specialNeeds ? true : false;

  const editAnimal = await Animal.findByIdAndUpdate(req.params.animalId, {
    $set: {
      name,
      category,
      size,
      image: req.file.path,
      checkin,
      checkout,
      description,
      careRoutine,
      specialNeeds: booleanCheck
    }
  })
  res.redirect('/user-profile')
};

const adoptAnimal = async (req, res, next) => {
  try {
    const animal = await Animal.findById(req.params.animalId);
    const adoption = await Adoption.create({
      animal: animal._id,
      checkin: animal.checkin,
      checkout: animal.checkout,
      owner: animal.owner,
      host: req.session.currentUser._id
    });
    const animalAdopted = await Animal.findOneAndUpdate({
      _id: req.params.animalId
    }, {
      adopted: true
    }, {
      new: true
    })
    res.redirect('/user-profile');
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).render('error', {
        errorMessage: error.message
      })
    } else if (error instanceof TypeError) {
      res.status(400).render('auth/login', {
        errorMessage: 'You must be logged in to access to adopt a pet'
      })
    } else {
      next(error)
    }
  }
};

module.exports = {
  getIndex,
  getUserProfile,
  getAnimalForm,
  createNewAnimal,
  getAnimalDetails,
  deleteAnimal,
  getAnimalsList,
  getEditAnimalForm,
  editAnimal,
  adoptAnimal,
}