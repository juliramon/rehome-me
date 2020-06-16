const express = require('express');
const router = express.Router();
const {
  getFeaturedAnimals
} = require('../controllers/index.controllers');

router
  .get('/', getFeaturedAnimals);

module.exports = router;