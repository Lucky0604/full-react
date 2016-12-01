const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const mongoose = require('mongoose');
const User = mongoose.model('User');
const _ = require('lodash');

module.exports = function(app) {
  const googleCredentials = {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CLIENT_CALLBACK
  };

  passport.use(new GoogleStrategy(googleCredentials, verifyCallback));

  function verifyCallback(accessToken, refreshToken, profile, done) {
    User.findOneAsync({
      'email': profile.emails[0].value
    })
    .then((user) => {
      // no need to fill in info w/profile if user already has Google log-in
      if (user && user.google._id) return Promise.resolve(user);
      user = user || new User();
      user = _.merge(user, {
        email: user.email || profile.emails[0].value,
        google: {
          _id: profile.id,
          photo: profile._json.image.url,
          link: profile._json.url
        }
      });
      return user.save();
    })
    .then((user) => done(null, user))
    .catch((err) => console.error('Error creating user from Google authentication', err) || done(err, null));
  }

  app.get('/auth/google', passport.authenticate('google', {
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ]
  }));

  app.get('/auth/google/callback', passport.authenticate('google', {failureRedirect: '/'}),
  function(req, res) {
    res.redirect('/');
  });
}