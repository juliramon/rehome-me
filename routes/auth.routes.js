const express = require('express');
const {
  loadSignupForm,
  submitSignupForm,
  loadLoginForm,
  submitLoginForm,
  logout
} = require('../controllers/auth.controllers');

const router = express.Router();

router
  .get('/signup', loadSignupForm)
  .post('/signup', submitSignupForm)
  .get('/login', loadLoginForm)
  .post('/login', submitLoginForm)
  .post('/logout', logout)

module.exports = router;