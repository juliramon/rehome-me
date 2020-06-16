const express = require('express');
const { 
  getIndex, 
  getUserProfile
} = require('../controllers/pages.controllers');

const router  = express.Router();

router
  .get('/', getIndex)
  .get('/user-profile', getUserProfile)

module.exports = router;
