const bcryptjs = require('bcryptjs');
const User = require('../models/User.model');
const mongoose = require('mongoose');

const saltRounds = 10;

const loadSignupForm = (req, res) => {
  if(!req.session.visitedUrls){
    req.session.visitedUrls = [];
    req.session.visitedUrls.push(req.url);
  } else {
    req.session.visitedUrls.push(req.url);
  }
  if(req.session.currentUser){
    return res.redirect('/user-profile');
  } else {
    return res.render('auth/signup');
  }
};

const submitSignupForm = async (req, res, next) => {
  try {
    const {
      username,
      email,
      password
    } = req.body;
    const hasEmptyCredentials = !username || !email || !password;
    if (hasEmptyCredentials) {
      return res.render('auth/signup', {
        errorMessage: 'Username, email and password are mandatory'
      });
      
    };

    const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    if (!regex.test(password)) {
      return res.status(400).render('auth/signup', {
        errorMessage: 'Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.'
      });
    };

    const salt = await bcryptjs.genSalt(saltRounds);
    const hashedPassword = await bcryptjs.hash(password, salt);
    const userSignup = await User.create({
      username,
      email,
      passwordHash: hashedPassword
    })
    req.session.currentUser = userSignup;
    res.redirect('/user-profile');
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).render('auth/signup', {
        errorMessage: error.message
      });
    } else if (error.code === 11000) {
      res.status(400).render('auth/signup', {
        errorMessage: 'Username or email already in use'
      });
    } else {
      next(error);
    }
  }
};

const loadLoginForm = (req, res) => {
  if(!req.session.visitedUrls){
    req.session.visitedUrls = [];
    req.session.visitedUrls.push(req.url);
  } else {
    req.session.visitedUrls.push(req.url);
  }
  if(req.session.currentUser){
    return res.redirect('/user-profile');
  } else {
    return res.render('auth/login');
  }
};

const submitLoginForm = async (req, res, next) => {
  try {
    const {
      username,
      password
    } = req.body;
    const hasEmptyCredentials = !username || !password;
    if (hasEmptyCredentials) {
      return res.render('auth/login', {
        errorMessage: 'Please enter both username and password to login'
      })
    };

    const userLogin = await User.findOne({
      username
    })
    if (!userLogin) {
      res.render('auth/login', {
        errorMessage: 'Username is not found. Try another username.'
      })
      return;
    } else if (bcryptjs.compareSync(password, userLogin.passwordHash)) {
      req.session.currentUser = userLogin;
      res.redirect('/user-profile')
      return;
    } else {
      res.render('auth/login', {
        errorMessage: 'Incorrect password. Try again.'
      });
      return;
    }
  } catch (err) {
    next(err)
  }
};

const logout = (req, res) => {
  req.session.destroy()
  res.redirect('/')
}

module.exports = {
  loadSignupForm,
  submitSignupForm,
  loadLoginForm,
  submitLoginForm,
  logout
}