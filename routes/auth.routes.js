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
  .get('/auth/google', passportAuth.google)
  .get('/auth/google/callback', passportAuthCallback.google)
  .get('/auth/facebook', passportAuth.facebook)
  .get('/auth/facebook/callback', passportAuthCallback.facebook)

module.exports = router;