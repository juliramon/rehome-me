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
  adoptAnimal,
  getSitterDetails,
  getSittersList,
  hireSitter,
  getEditProfileForm,
  editUser,
  deleteUser,
  acceptAdoption,
  rejectAdoption,
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
  .post('/animal/:animalId/adopt', adoptAnimal)
  .get('/users', getSittersList)
  .get('/user/:userId', getSitterDetails)
  .post('/user/:userId/hire', hireSitter)
  .get('/user/:userId/edit', getEditProfileForm)
  .post('/user/:userId/edit', fileUploader.single('avatar'), editUser)
  .get('/user/:userId/delete', deleteUser)
  .get('/adoption/:adoptionId/accept', acceptAdoption)
  .get('/adoption/:adoptionId/reject', rejectAdoption)

module.exports = router;