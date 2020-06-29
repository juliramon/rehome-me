require('../configs/session.config');

const mongoose = require('mongoose');
const uploadCloud = require('../configs/cloudinary.config');
const Animal = require('../models/Animal.model');
const Adoption = require('../models/Adoption.model');
const {
  formatDate
} = require('../helpers/helpers');
const User = require('../models/User.model');

const getIndex = async (req, res, next) => {
  try {
    const animals = await Animal.find({
      adopted: 'not-adopted',
      type: 'adoption'
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
      adopted: 'not-adopted'
    })

    const openProcesses = await Adoption.find({
      $or: [{
        $and: [{
          status: 'pending'
        }, {
          owner: req.session.currentUser._id
        }, {
          type: 'temporary'
        }]
      }, {
        $and: [{
          status: 'pending'
        }, {
          host: req.session.currentUser._id
        }, {
          type: 'permanent'
        }]
      }]
    }).populate('animal').populate('owner').populate('host');

    const pendingProcesses = await Adoption.find({
      $or: [{
        $and: [{
          status: 'pending'
        }, {
          type: 'temporary'
        }, {
          host: req.session.currentUser._id
        }]
      }, {
        $and: [{
          status: 'pending'
        }, {
          owner: req.session.currentUser._id
        }, {
          type: 'permanent'
        }]
      }]
    }).populate('animal').populate('owner').populate('host');

    const processesFinished = await Adoption.find({
      $or: [{
        status: 'accepted'
      }, {
        status: 'rejected'
      }]
    }).populate('animal').populate('owner').populate('host')

    const user = await User.findById(req.session.currentUser._id)
    res.render('user-profile', {
      user,
      userInSession: req.session.currentUser,
      userAnimals,
      openProcesses,
      pendingProcesses,
      processesFinished
    })
  } catch (error) {
    console.log('Error getting the user profile =>', error)
  }
}

const getAnimalForm = (req, res) => {
  try {
    const filter = req.query.filter
    res.render('add-animal', {
      userInSession: req.session.currentUser,
      filter
    });
  } catch (error) {
    console.log('Error getting the add animal form =>', error)
  }
}

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
      type,
    } = req.body;

    const hasEmptyCredentials = !name || !category || !size || !checkin || !description;
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
      type,
      adopted: 'not-adopted',
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
  try {
    const filter = {
      adopted: 'not-adopted',
      type: 'adoption'
    }
    if (req.query.filter) {
      filter.category = req.query.filter
    }

    const animals = await Animal.find(filter);
    res.render('animals', {
      animals,
      userInSession: req.session.currentUser,
      activeFilter: req.query.filter
    })
  } catch (error) {
    console.log('Error getting the animals list =>', error)
  }
}

const getEditAnimalForm = async (req, res, next) => {
  try {
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
  } catch (error) {
    console.log('Error loading the edit animal form =>', error)
  }
};

const editAnimal = async (req, res, next) => {
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
    const booleanCheck = specialNeeds ? true : false;
    const formFields = {
      name,
      category,
      size,
      checkin,
      checkout,
      description,
      careRoutine,
      specialNeeds: booleanCheck
    }
    if (req.file) {
      formFields.image = req.file.path;
    }
    const editAnimal = await Animal.findByIdAndUpdate(req.params.animalId, {
      $set: formFields
    })
    res.redirect('/user-profile')
  } catch (error) {
    console.log('Error editing the animal =>', error)
  }
};

const adoptAnimal = async (req, res, next) => {
  try {
    const animal = await Animal.findById(req.params.animalId);
    const adoption = await Adoption.create({
      animal: animal._id,
      checkin: animal.checkin,
      owner: animal.owner,
      host: req.session.currentUser._id,
      type: 'permanent',
      status: 'pending'
    });

    const animalAdopted = await Animal.findOneAndUpdate({
      _id: req.params.animalId
    }, {
      adopted: 'solicited'
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

const getEditProfileForm = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId)
    res.render('edit-user', {
      user
    });
  } catch (error) {
    console.log('Error getting the user edit profile form =>', error)
  }
};

const editUser = async (req, res, next) => {
  try {
    const {
      username,
      description,
      sitter
    } = req.body;
    const booleanCheck = sitter ? true : false;
    const formFields = {
      username,
      description,
      sitter: booleanCheck
    }
    if (req.file) {
      formFields.avatar = req.file.path;
    }
    const editUser = await User.findByIdAndUpdate(req.params.userId, {
      $set: formFields
    })
    res.redirect('/user-profile')
  } catch (error) {
    console.log('Error editting the user profile =>', error);
  }
};

const getSittersList = async (req, res, next) => {
  try {
    const sitters = await User.find({
      sitter: true
    });
    res.render('users', {
      sitters,
      userInSession: req.session.currentUser
    });
  } catch (error) {
    console.log('Error getting the sitters list =>', error);
  }
};

const getSitterDetails = async (req, res, next) => {
  try {
    const userAnimals = await Animal.find({
      owner: req.params.userId,
    });

    const user = await User.findById(req.params.userId);

    const animalsForSitting = await Animal.find({
      owner: req.session.currentUser._id,
      type: 'sitting'
    });

    const userHostSitting = await Adoption.find({
      $and: [{
        owner: req.session.currentUser._id
      }, {
        host: req.params.userId
      }, {
        status: 'accepted'
      }, {
        type: 'temporary'
      }, {
        rate: 0
      }]
    }).populate('animal').populate('host');

    const ratingAvg = (user.ratings.length == 0) ? false : user.ratings.reduce((a, b) => a + b, 0) / user.ratings.length;
    const userValorations = (userHostSitting.length == 0) ? false : userHostSitting;

    if (user._id == req.session.currentUser._id) {
      res.render('user-profile', {
        user,
        userAnimals,
        userInSession: req.session.currentUser,
        animalsForSitting
      });
    } else {
      res.render('userProfilePublic', {
        user,
        userAnimals,
        ratingAvg,
        userValorations,
        userInSession: req.session.currentUser,
        animalsForSitting
      });
    }
  } catch (error) {
    console.log('Error loading the user profile >', error);
  }
}

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.deleteOne({
      _id: req.params.userId
    })
    const userAnimals = await Animal.deleteMany({
      owner: req.session.currentUser._id
    })
    req.session.destroy();
    res.redirect('/');
  } catch (error) {
    console.log('Error deleting the user =>', error);
  }
}

const hireSitter = async (req, res, next) => {
  try {
    const {
      animalid
    } = req.body

    const animal = await Animal.findById(animalid);

    const sitting = await Adoption.create({
      animal: animal._id,
      checkin: animal.checkin,
      checkout: animal.checkout,
      owner: req.session.currentUser._id,
      host: req.params.userId,
      type: 'temporary',
      status: 'pending'
    });

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
}

const acceptAdoption = async (req, res, next) => {
  try {
    const adoption = await Adoption.findByIdAndUpdate(req.params.adoptionId, {
      status: 'accepted'
    }, {
      new: true
    }).populate('animal');

    if (adoption.type === 'permanent') {
      const animalAdopted = await Animal.findByIdAndUpdate(adoption.animal._id, {
        adopted: 'adopted'
      }, {
        new: true
      })
    }

    res.redirect('/user-profile')
  } catch (error) {
    console.log('Error while adopting the animal=> ', error)
  }
}

const rejectAdoption = async (req, res, next) => {
  try {
    const adoption = await Adoption.findByIdAndUpdate(req.params.adoptionId, {
      status: 'rejected'
    }, {
      new: true
    }).populate('animal');

    const animalAdopted = await Animal.findByIdAndUpdate(adoption.animal._id, {
      adopted: 'not-adopted'
    }, {
      new: true
    })

    res.redirect('/user-profile')
  } catch (error) {
    console.log('Error while adopting the animal=> ', error)
  }
}

const rateSitter = async (req, res, next) => {
  try {
    const {
      rate,
      comment
    } = req.body

    const rateSitting = await Adoption.findByIdAndUpdate(req.params.adoptionId, {
      rate: rate
    }, {
      new: true
    }).populate('host')

    const pushUserValoration = await User.findByIdAndUpdate(rateSitting.host._id, {
      $push: {
        ratings: rate,
        comments: comment
      }
    }, {
      new: true
    })

    res.redirect('/users');
  } catch (error) {
    console.log('Error while rating the sitter=> ', error)
  }
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
  editAnimal,
  adoptAnimal,
  getSittersList,
  getEditProfileForm,
  editUser,
  getSitterDetails,
  deleteUser,
  hireSitter,
  acceptAdoption,
  rejectAdoption,
  rateSitter
}