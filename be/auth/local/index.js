'use strict';

var passport = require('passport');
var _ = require('lodash');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports = function(app) {
  passport.use(new LocalStrategy({usernameField: 'email', passwordField: 'password'}, strategyFn));

  // When passport.authenticate('local') is used, this function will receive
  // the email and password to run the actual authentication logic
  function strategyFn(email, password, done) {
    User.findOne({email: email})
      .then(function(user) {
        // user.corectPassword is a method from the User schema
        if (!user || !user.correctPassword(password)) {
          done(null, false);
        } else {
          // properly authenticated
          done(null, user);
        }
      }, function(err) {
        done(err);
      });
  }

  // POST /login route is created to handle login
  app.post('/auth/login', function(req, res, next) {
    passport.authenticate('local', authCb)(req, res, next);

    function authCb(err, user) {
      if (err) return next(err);

      // if the user's login credentials don't match any users, just create a new user
      if (!user) {
        User.findOneAsync({'email': req.body.email})
          .then(foundUser => {
            if (foundUser) {
              console.log('adding password to existing user');
              foundUser.password = req.body.password;
              return foundUser.saveAsync();
            } else {
              console.log('creating new user');
              return (new User(req.body)).saveAsync();
            }
          }).then(storedUser => {
            res.status(200).json(_.merge(_.omit((storedUser[0] || storedUser).toObject(), ['password', 'salt']), {
              hasPassword: true
            }));
          });
      } else {
        console.log('found existing user');
        // req.login will establish the session
        req.login(user, loginErr => {
          if (loginErr) return next(loginErr);
          // respond with a response object that has user with _id and email
          res.status(200).json(_.merge(_.omit(req.user.toObject(), ['password', 'salt']), {
            hasPassword: true
          }));
        });
      }
    }
  })
};