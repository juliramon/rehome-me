const express = require('express');
const {
  getIndex,
  getUserProfile,
  getAnimalForm,
  createNewAnimal
} = require('../controllers/pages.controllers');

const router = express.Router();

router
  .get('/', getIndex)
  .get('/user-profile', getUserProfile)
  .get('/animal/add', getAnimalForm)
  .post('/animal/add', createNewAnimal)

module.exports = router;