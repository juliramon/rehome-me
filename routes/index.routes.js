const express = require('express');
const {
  getIndex,
  getUserProfile,
  getAnimalForm,
  createNewAnimal,
  getAnimalDetails,
  deleteAnimal,
  getAnimalsList
} = require('../controllers/pages.controllers');

const router = express.Router();

router
  .get('/', getIndex)
  .get('/user-profile', getUserProfile)
  .get('/animal/add', getAnimalForm)
  .post('/animal/add', createNewAnimal)
  .get('/animal/:id', getAnimalDetails)
  .get('/animal/:id/delete', deleteAnimal)
  .get('/animals', getAnimalsList)

module.exports = router;