const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const _ = require('lodash');
const passport = require('passport');
const Promise = require('bluebird');
const mongoose = require('mongoose');
const User = mongoose.model('User');

// promisify `User` and all instances of `User`
Promise.promisifyAll(User);
Promise.promisifyAll(User.prototype);

module.exports = (app) => {
  // session middleware will set/read sessions from the request
  // the sessions will get stored in Mongo using the same connection from mongoose
  app.use(session({
    secret: process.env.SESSION_SECRET,
    store: new MongoStore({
      mongooseConnection: mongoose.connection
    }),
    cookie: {
      maxAge: new Date(Date.now() + 1000*60*60*24)  // stores cookie for one day
    },
    resave: false,
    saveUninitialized: false
  }));

  // Initialize passport and also allow it to read
  app.use(passport.initialize());

  // Read request session information
  app.use(passport.session());

  // when we give a cookie to the browser, it is just the userId (encrypted with our secret)
  passport.serializeUser((user, done) => done(null, user._id));

  // when we receive a cookie from the browser, we use that id to set our req.user to a user found in the database
  passport.deserializeUser((id, done) =>
    User.findByIdAsync(id)
      .then(user => done(null, user))
      .catch(err => console.log(err)));

  // gets user off session if logged in
  app.get('/auth/session', (req, res) =>
    !req.user ?
    res.status(200).send('') : 
    res.status(200).json(_.merge(_.omit(req.user.toObject(), ['password', 'salt']), {
      hasPassword: !! req.user.password
    })));

  // /logout route
  app.get('/auth/logout', (req, res) => {
    req.session.destroy();
    res.status(200).end();
  });

  require('./local')(app);
  require('./google')(app);
  require('./facebook')(app);
}
