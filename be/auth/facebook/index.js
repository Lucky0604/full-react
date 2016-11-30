'use strict';

const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const mongoose = require('mongoose');
const User = mongoose.model('User');
const _ = require('lodash');

module.exports = function(app) {
  const facebookCredentials = {
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: process.env.FACEBOOK_CLIENT_CALLBACK,
    profileFields: ['email', 'photos', 'link']    // same as google Strategy's "scope"
  };

  var verifyCallback = function(accessToken, refreshToken, profile, done) {
    User.findOneAsync({
      'email': profile && profile.emails && profile.emails[0] && profile.emails[0].value
    })
    .then((user) => {
      if (user && user.facebook._id) return Promise.resolve(user);
      user = user || new User();
      // use facebook profile to fill out user info if it does not already exist
      user = _.merge(user, {
        // in case user has not provided email
        email: user.email || profile && profile.emails && profile.emails[0] && profile.emails[0].value,
        facebook: {
          _id: profile.id,
          photo: profile.photos[0].value,
          link: profile.profileUrl
        }
      });
      return user.save();
    })
    .then((user) => {
      const objUser = user.toObject && user.toObject() || user;
      objUser.profile = profile;
      done(null, objUser);
    })
    .catch((err) => console.error('Error creating user from Facebook authentication', err) || done(err, null));
  };

  passport.use(new FacebookStrategy(facebookCredentials, verifyCallback));

  app.get('/auth/facebook', passport.authenticate('facebook', {
    scope: 'email'
  }));

  app.get('/auth/facebook/callback', 
    passport.authenticate('facebook', {
      failureRedirect: '/',
      scope: 'email'
    }),
    function(req, res) {
      res.redirect('/')
    });
}