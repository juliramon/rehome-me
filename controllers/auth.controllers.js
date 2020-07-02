const bcryptjs = require('bcryptjs');
const User = require('../models/User.model');
const mongoose = require('mongoose');
const passport = require('passport');
const app = require('../app');
const {
  generateUsername
} = require('../helpers/helpers');
const {
  transporter,
  createAccount
} = require('../configs/nodemailer.config');

const saltRounds = 10;

const loadSignupForm = (req, res) => {
  if (req.session.currentUser) {
    return res.redirect('/user-profile');
  } else {
    return res.render('auth/signup');
  }
};

const submitSignupForm = async (req, res, next) => {
  try {
    const {
      fullname,
      email,
      password
    } = req.body;
    const hasEmptyCredentials = !fullname || !email || !password;
    if (hasEmptyCredentials) {
      return res.render('auth/signup', {
        errorMessage: 'Name and lastname, email and password are mandatory'
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
    const username = generateUsername(fullname)
    const userSignup = await User.create({
      fullname,
      username,
      email,
      passwordHash: hashedPassword
    })
    req.session.currentUser = userSignup;

    const userMail = await User.findById(req.session.currentUser._id);
    const info = await transporter.sendMail({
      from: process.env.GMAIL_ACCOUNT,
      to: userMail.email,
      subject: `Welcome to Rehome Me!`,
      text: 'We are sad to see you go',
      html: createAccount(userMail.fullname)
    }, (error, info) => error ? console.log(error) : console.log('Email sent: ' + info.response))

    res.redirect('/user-profile');
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).render('auth/signup', {
        errorMessage: error.message
      });
    } else if (error.code === 11000) {
      res.status(400).render('auth/signup', {
        errorMessage: 'Email already in use'
      });
    } else {
      next(error);
    }
  }
};

const loadLoginForm = (req, res) => {
  if (req.session.currentUser) {
    return res.redirect('/user-profile');
  } else {
    return res.render('auth/login');
  }
};

const submitLoginForm = async (req, res, next) => {
  try {
    const {
      email,
      password
    } = req.body;
    const hasEmptyCredentials = !email || !password;
    if (hasEmptyCredentials) {
      return res.render('auth/login', {
        errorMessage: 'Please enter both email and password to login'
      })
    };

    const userLogin = await User.findOne({
      email
    })
    if (!userLogin) {
      res.render('auth/login', {
        errorMessage: 'Email is not found. Try again.'
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

const passportAuth = {
  google: passport.authenticate('google', {
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ]
  }),
  facebook: passport.authenticate('facebook', {
    scope: 'email'
  })
}

const passportAuthCallback = {
  google: passport.authenticate('google', {
    successRedirect: '/user-profile',
    failureRedirect: '/login'
  }),
  facebook: passport.authenticate('facebook', {
    successRedirect: '/user-profile',
    failureRedirect: '/login'
  }),
}

module.exports = {
  loadSignupForm,
  submitSignupForm,
  loadLoginForm,
  submitLoginForm,
  logout,
  passportAuth,
  passportAuthCallback
}