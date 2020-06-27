require('dotenv').config();
require('./configs/session.config');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const favicon = require('serve-favicon');
const hbs = require('hbs');
const mongoose = require('mongoose');
const logger = require('morgan');
const path = require('path');
const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('./models/User.model');
const {generateUsername} = require('./helpers/helpers');

const indexRouter = require('./routes/pages.routes');
const authRouter = require('./routes/auth.routes');

const app = express();

require('./configs/session.config')(app);
require('./configs/db.config');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());

// PASSPORT SETUP
passport.serializeUser(async(user, callback) => {
  callback(null, user._id)
});
passport.deserializeUser(async(id, callback) => {
  try{
    const passportUser = await User.findById(id);
    callback(null, passportUser);
  }catch(error){
    callback(error);
  }
});

passport.use(
  new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try{
      const foundUser = await User.findOne({googleId: profile.id});
      if(foundUser){
        return done(null, foundUser);
      }
      try { 
        const username = generateUsername(profile.displayName);
        const newUser = await User.create({googleId: profile.id, fullname: profile.displayName, username: username, email: profile.emails[0].value, avatar: profile.photos[0].value});
        done(null, newUser);
      }catch(error){
        done(error);
      }
    }catch(error){
      console.log(error)
    }
  })
);

passport.use(
  new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: '/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'name', 'email', 'gender', 'photos']
  },
  async (accessToken, refreshToken, profile, done) => {
    console.log(profile)
    try{
      const foundUser = await User.findOne({facebookId: profile.id});
      if(foundUser){
        return done(null, foundUser);
      }
      try { 
        const username = generateUsername(profile.displayName);
        const newUser = await User.create({facebookId: profile.id, fullname: profile.displayName, username: username, email: profile.emails[0].value, avatar: profile.photos[0].value});
        done(null, newUser);
      }catch(error){
        done(error);
      }
    }catch(error){
      console.log(error)
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  if(req.user){
    req.session.currentUser = req.user;
  }
  next();
})

app.use(require('node-sass-middleware')({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

hbs.registerPartials(path.join(__dirname, 'views/partials'));

hbs.registerHelper('isSelected', function (options, size) {
  return options === size ? 'selected' : '';
});
hbs.registerHelper('ifvalue', function (conditional, options) {
  if (options.hash.value === conditional) {
    return options.fn(this)
  } else {
    return options.inverse(this);
  }
});

app.locals.title = 'Express - Generated with IronGenerator';

const recordRoute = (req, res, next) => {
  if (!req.session.visitedUrls) {
    req.session.visitedUrls = [];
    req.session.visitedUrls.push(req.url);
  } else {
    req.session.visitedUrls.push(req.url);
  }
  next()
}

app.use(recordRoute);

app.use('/', indexRouter);
app.use('/', authRouter);

module.exports = app;