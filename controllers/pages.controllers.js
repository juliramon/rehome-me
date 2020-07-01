require('../configs/session.config');

const mongoose = require('mongoose');
const uploadCloud = require('../configs/cloudinary.config');
const transporter = require('../configs/nodemailer.config');
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
    const filter = req.query.filter;
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
    }).populate('animal').populate('owner').populate('host');
    const user = await User.findById(req.session.currentUser._id)
    res.render('user-profile', {
      user,
      filter,
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

    const adopt = await Adoption.findById(adoption._id).populate('owner').populate('host');

    contentHTML = `<div style="background: #4D716D; height: 100px; background-size: cover;
    background-repeat: no-repeat; text-align: center; padding: 35px; font-size:1.3em; color:#cce0dd;">
    <h1>Someone is interested in <strong> ${animal.name}, ${adopt.owner.fullname}!</strong></h1>
  </div>
  <section style="padding: 20px; margin: 50px; border: 2px solid #4D716D; border-radius:40px; text-align: center;">
    <h2>ADOPTION PETITION</h2>
    <p>The user ${adopt.host.username} in the <strong>Rehome Me</strong> webpage is interested in rehoming
      ${animal.name} and being it's forever home!
    </p>
    <p>Please, log in at <a href="http://rehome-me.herokuapp.com/">Rehome Me</a> as soon as you can to accept or reject
      this petition.</p>
    <div>
      <img src="https://d17fnq9dkz9hgj.cloudfront.net/uploads/2015/09/hfh-dog-hero.jpg" alt="dog-adoption">
    </div>
  </section>`

    const info = await transporter.sendMail({
      from: process.env.GMAIL_ACCOUNT,
      to: adopt.owner.email,
      subject: `Someone is interested ${animal.name}, ${adopt.owner.fullname}!`,
      text: 'We are sad to see you go',
      html: contentHTML
    }, (error, info) => error ? console.log(error) : console.log('Email sent: ' + info.response))

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
      user,
      userInSession: req.session.currentUser
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

    const ratingAvg = (user.ratings.length == 0) ? false : (user.ratings.reduce((a, b) => a + b, 0) / user.ratings.length).toFixed(1);
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
    const userMail = await User.findById(req.params.userId)

    contentHTML = `<div style="background: #4D716D; height: 100px; background-size: cover;
    background-repeat: no-repeat; text-align: center; padding: 35px; font-size:1.5em; color:#cce0dd;">
    <h1>We are sorry to see yo go <strong>${userMail.fullname}</strong></h1>
  </div>
  <section
    style="padding: 20px; margin: 50px; border: 2px solid #4D716D; border-radius:40px; text-align: center;">
    <h2>ACCOUNT CANCELLATION</h2>
    <p>This is a confirmation that your <strong>Rehome Me</strong> account has been cancelled.<br>
      We are sorry to see you go, and if there is anything that you didn't like of our service, please let us now so
      that
      we can improve it.
    </p>
    <div>
      <img
        src="https://s3.amazonaws.com/cdn-origin-etr.akc.org/wp-content/uploads/2019/07/15092404/do-dogs-grieve-other-dogs.jpg"
        alt="sad-dog">
    </div>
    <p><b>If you want to use our services again, we'll be at <a href="http://rehome-me.herokuapp.com/">Rehome Me</a>
        for
        you!
        :)</b</p> </section>`

    const info = await transporter.sendMail({
      from: process.env.GMAIL_ACCOUNT,
      to: userMail.email,
      subject: 'We are sorry to see you go ' + userMail.fullname,
      text: 'We are sad to see you go',
      html: contentHTML
    }, (error, info) => error ? console.log(error) : console.log('Email sent: ' + info.response))

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

    const sitt = await Adoption.findById(
      sitting._id
    ).populate('owner').populate('host');

    contentHTML = `<div style="background: #4D716D; height: 100px; background-size: cover;
    background-repeat: no-repeat; text-align: center; padding: 35px; font-size:1.5em; color:#cce0dd;">
    <h1>Someone is interested in your sitting service <strong>${sitt.host.fullname}</strong></h1>
  </div>
  <section style="padding: 20px; margin: 50px; border: 2px solid #4D716D; border-radius:40px; text-align: center;">
    <h2>SITTING PETITION</h2>
    <p>The user ${sitt.owner.username} in the <strong>Rehome Me</strong> webpage is interested in your services as a
      sitter!<br>
      The pet's check-in date would be <strong>${sitt.checkin}</strong> and it will be returning to it's owner the
      <strong>${sitt.checkout}</strong> as soon as you can to accept or reject this petition.
    </p>
    <p>Please, log in at <a href="http://rehome-me.herokuapp.com/">Rehome Me</a></p>
    <div>
      <img src="https://www.veterinarypracticenews.com/wp-content/uploads/2018/06/Pet-Sitter.jpg" alt="dog-sitter">
    </div>
  </section>`

    const info = await transporter.sendMail({
      from: process.env.GMAIL_ACCOUNT,
      to: sitt.host.email,
      subject: 'Someone is interested in your service ' + sitt.host.fullname,
      text: 'We are sad to see you go',
      html: contentHTML
    }, (error, info) => error ? console.log(error) : console.log('Email sent: ' + info.response))

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
    }).populate('animal').populate('host').populate('owner');

    if (adoption.type === 'permanent') {
      const animalAdopted = await Animal.findByIdAndUpdate(adoption.animal._id, {
        adopted: 'adopted'
      }, {
        new: true
      });
    }

    contentHTML = `<div style="background: #4D716D; height: 100px; background-size: cover;
    background-repeat: no-repeat; text-align: center; padding: 35px; font-size:1.5em; color:#cce0dd;">
    <h1>The process has been closed!</h1>
  </div>
  <section style="padding: 20px; margin: 50px; border: 2px solid #4D716D; border-radius:40px; text-align: center;">
    <h2>PROCESS CLOSED</h2>
    <p>The process opened about the ${adoption.animal.name} in the <strong>Rehome Me</strong> webpage has been
      closed.<br>
      The actual petition status is ${adoption.status}.
      <ul style="list-style-type: none">
        <li><b>Animal's name</b>: ${adoption.animal.name}</li>
        <li><b>Current owner</b>: ${adoption.owner.username}</li>
        <li><b>Owner's email</b>: ${adoption.owner.email}</li>
        <li><b>Host</b>: ${adoption.host.username}</li>
        <li><b>Host's email</b>: ${adoption.host.email}</li>
      </ul>
    </p>
    <p>To obtain more details, please log in at <a href="http://rehome-me.herokuapp.com/">Rehome Me</a>.</p>
    <div>
      <img
        src="https://images2.minutemediacdn.com/image/upload/c_crop,h_1195,w_2127,x_0,y_0/f_auto,q_auto,w_1100/v1586626259/shape/mentalfloss/606627-gettyimages-1080967246.jpg"
        alt="process-finished">
    </div>
  </section>`

    const info = await transporter.sendMail({
      from: process.env.GMAIL_ACCOUNT,
      to: `${adoption.host.email}, ${adoption.owner.email}`,
      subject: 'Your opened process in Rehome Me has been closed!',
      text: 'We are sad to see you go',
      html: contentHTML
    }, (error, info) => error ? console.log(error) : console.log('Email sent: ' + info.response))

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
    }).populate('animal').populate('owner').populate('host');

    const animalAdopted = await Animal.findByIdAndUpdate(adoption.animal._id, {
      adopted: 'not-adopted'
    }, {
      new: true
    })

    contentHTML = `<div style="background: #4D716D; height: 100px; background-size: cover;
    background-repeat: no-repeat; text-align: center; padding: 35px; font-size:1.5em; color:#cce0dd;">
    <h1>The process has been closed!</h1>
  </div>
  <section style="padding: 20px; margin: 50px; border: 2px solid #4D716D; border-radius:40px; text-align: center;">
    <h2>PROCESS CLOSED</h2>
    <p>The process opened about the ${adoption.animal.name} in the <strong>Rehome Me</strong> webpage has been
      closed.<br>
      The actual petition status is ${adoption.status}.
      <ul style="list-style-type: none">
        <li><b>Animal's name</b>: ${adoption.animal.name}</li>
        <li><b>Current owner</b>: ${adoption.owner.username}</li>
        <li><b>Owner's email</b>: ${adoption.owner.email}</li>
        <li><b>Host</b>: ${adoption.host.username}</li>
        <li><b>Host's email</b>: ${adoption.host.email}</li>
      </ul>
    </p>
    <p>To obtain more details, please log in at <a href="http://rehome-me.herokuapp.com/">Rehome Me</a>.</p>
    <div>
      <img
        src="https://images2.minutemediacdn.com/image/upload/c_crop,h_1195,w_2127,x_0,y_0/f_auto,q_auto,w_1100/v1586626259/shape/mentalfloss/606627-gettyimages-1080967246.jpg"
        alt="process-finished">
    </div>
  </section>`

    const info = await transporter.sendMail({
      from: process.env.GMAIL_ACCOUNT,
      to: `${adoption.host.email}, ${adoption.owner.email}`,
      subject: 'Your opened process in Rehome Me has been closed!',
      text: 'We are sad to see you go',
      html: contentHTML
    }, (error, info) => error ? console.log(error) : console.log('Email sent: ' + info.response))

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