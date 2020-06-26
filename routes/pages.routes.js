const express = require('express');
const fileUploader = require('../configs/cloudinary.config');
const ensureLogin = require('connect-ensure-login');

const {
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
  getSitterDetails,
  getSittersList,
  getEditProfileForm,
  editUser,
  deleteUser
} = require('../controllers/pages.controllers');

const router = express.Router();

router
  .get('/', getIndex)
  .get('/user-profile', ensureLogin.ensureLoggedIn(), getUserProfile)
  .get('/animal/add', ensureLogin.ensureLoggedIn(), getAnimalForm)
  .post('/animal/add', fileUploader.single('image'), createNewAnimal)
  .get('/animal/:id', getAnimalDetails)
  .get('/animal/:id/delete', ensureLogin.ensureLoggedIn(), deleteAnimal)
  .get('/animals', getAnimalsList)
  .get('/animal/:animalId/edit', ensureLogin.ensureLoggedIn(), getEditAnimalForm)
  .post('/animal/:animalId/edit', fileUploader.single('image'), editAnimal)
  .post('/animal/:animalId/adopt', adoptAnimal)
  .get('/users', getSittersList)
  .get('/user/:userId', getSitterDetails)
  .get('/user/:userId/edit', ensureLogin.ensureLoggedIn(), getEditProfileForm)
  .post('/user/:userId/edit', fileUploader.single('avatar'), editUser)
  .get('/user/:userId/delete', ensureLogin.ensureLoggedIn(), deleteUser)
  
module.exports = router;