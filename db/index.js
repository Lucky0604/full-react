const mongoose = require('mongoose');
const Promise = require('bluebird');

module.exports = (URI) => {
  // 使用mongoose联结数据库
  const db = mongoose.connect(URI).connection;

  // 注册mongoose模型
  require('./models/post');
  require('./models/user');

  // 联结数据库后返回promise
  return new Promise(function(resolve, reject) {
    db.on('connected', () => !console.log("Database connect successful!"));
    db.on('open', resolve);   // 模型载入
    db.on('error', reject);
  })
}