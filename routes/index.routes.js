const express = require('express');
const {
  getIndex,
  getUserProfile,
  getAnimalForm,
  createNewAnimal,
  getAnimalsList
} = require('../controllers/pages.controllers');

const router = express.Router();

router
  .get('/', getIndex)
  .get('/user-profile', getUserProfile)
  .get('/animal/add', getAnimalForm)
  .post('/animal/add', createNewAnimal)
  .get('/animals', getAnimalsList)

module.exports = router;