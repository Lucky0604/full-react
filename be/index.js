// express and express middlewares
const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compression = require('compression');
const favicon = require('serve-favicon');
const cors = require('cors');

// environment variable importing
const dotenv = require('dotenv');

// webpack imports
const webpack = require('webpack');
const config = require('../webpack.config.dev');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

dotenv.config();

// initial express
// it's possible to run multiple express instances in the same node app and have them listen on diff ports
const app = express();
const serverPort = process.env.PORT || process.env.DEV_PORT || 3000;

// run React-hot-loader via our webpack dev configuration if in dev mode
if (process.env.NODE_ENV !== 'production') {
  const compiler = webpack(config);
  // noInfo flag prevents webpacks (verbose) default console logs and only logs errors and warnings
  app.use(webpackDevMiddleware(compiler, {noInfo: true, publicPath: config.output.publicPath}));
  app.use(webpackHotMiddleware(compiler));
}

/**
 * request parsing middleware
 */
// allows request body parsing
app.use(bodyParser.json());
// allows request query string parsing, extended: false means query string values can't contain JSON (must be simple key-value)
app.use(bodyParser.urlencoded({extended: false}));
// allows cookie parsing
app.use(cookieParser());

// allow cors (this allows serve assets, images for example, from other domains)
app.use(cors());

// gzips (technically compresses with zlib) responses HTTP requests
app.use(compression());

// app root folder path
// __dirname is a global variable available in any file and refers to that file's directory path
const root = path.resolve(__dirname, '..');

// used to set favicon
app.use(favicon(path.join(root, 'public', 'favicon.ico')));

// set static folder
app.use(express.static(path.join(root, 'public')));

// log requests to console
if (process.env.NODE_ENV !== 'production') {
  app.use(logger('dev'));
}

const startDbPromise = require(path.join(root, 'db'))(process.env.DATABASE_URI);

startDbPromise.then(() => {
  // bring in API routes from crud folder, don't need to specify 'index.js' inside of the 'crud' folder
  // if file is unspecified 'index.js' is default when folder is required
  app.use('/api', require(path.join(root, 'server', 'crud')));

  // bring in Auth routes from auth folder (must feed in app as middlewares are added at this step)
  require(path.join(root, 'server', 'auth'))(app);

  // serve index.html from root
  app.get('/', (req, res, next) => res.sendFile('/index.html'), {
    root: path.join(root, 'public')
  })

  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // Handle route errors
  app.use((err, req, res, next) => {
    console.error(err);   // log to back end console
    res.status(err.status || 500);
    res.send(err.message);    // send error message test to front end
  });

  // launch server on port
  app.listen(serverPort, (err, res) => err ?
    handleError(err): console.log(`app served on port ${serverPort}`)
  );
}).catch(err => console.log(err));

// define 'handleError' here and use it above, because of `declarations are hoisted in JS (can only be done with functions created with this syntax)
function handleError(err) {
  switch (err.code) {
    case 'EACCES':
      console.error(`port ${serverPort} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`port ${serverPort} is already in use`);
      process.exit(1);
      break;
    default:
      console.log(err);
      process.exit(1);
  }
}