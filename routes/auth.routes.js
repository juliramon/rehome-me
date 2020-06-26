const express = require('express');
const {
  loadSignupForm,
  submitSignupForm,
  loadLoginForm,
  submitLoginForm,
  logout,
  passportAuth,
  passportAuthCallback
} = require('../controllers/auth.controllers');

const router = express.Router();

router
  .get('/signup', loadSignupForm)
  .post('/signup', submitSignupForm)
  .get('/login', loadLoginForm)
  .post('/login', submitLoginForm)
  .post('/logout', logout)
  .get('/auth/google', passportAuth)
  .get('/auth/google/callback', passportAuthCallback)

module.exports = router;