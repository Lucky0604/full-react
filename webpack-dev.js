// Work in progress, plan is to separate front end hot reloading of JS files from back end of app (for non-Node.js back ends)

// webpack-dev-server with config
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var dotenv = require('dotenv');
var config = require('./webpack.config.dev');

// 获取.env文件里的键值对，使其成为"process.env"对象的属性，并可在app中任意位置访问
dotenv.config();

const appPort = process.env.PORT || process.env.DEV_PORT || 3000;
const webpackPort = +appPort+1;

new WebpackDevServer(webpack(config), {
  contentBase: './public',
  debug: true,
  hot: true,
  historyApiFallback: true,
  proxy: {
    "*": "http://localhost:" + appPort
  }
}).listen(webpackPort, '0.0.0.0', function(err, result) {
  if (err) console.log(err);
  console.log('Webpack Dev Server listening at localhost:' + webpackPort);
})