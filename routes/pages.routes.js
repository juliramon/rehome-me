const express = require('express');
const fileUploader = require('../configs/cloudinary.config');

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
  getSitterDetails,
  getSittersList,
  getEditProfileForm,
  editUser,
  deleteUser
} = require('../controllers/pages.controllers');

const router = express.Router();

router
  .get('/', getIndex)
  .get('/user-profile', getUserProfile)
  .get('/animal/add', getAnimalForm)
  .post('/animal/add', fileUploader.single('image'), createNewAnimal)
  .get('/animal/:id', getAnimalDetails)
  .get('/animal/:id/delete', deleteAnimal)
  .get('/animals', getAnimalsList)
  .get('/animal/:animalId/edit', getEditAnimalForm)
  .post('/animal/:animalId/edit', fileUploader.single('image'), editAnimal)
  .get('/users', getSittersList)
  .get('/user/:userId', getSitterDetails)
  .get('/user/:userId/edit', getEditProfileForm)
  .post('/user/:userId/edit', fileUploader.single('avatar'), editUser)
  .get('/user/:userId/delete', deleteUser)
  
module.exports = router;