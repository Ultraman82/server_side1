module.exports = function(){
  var express = require('express');
  var session = require('express-session');
  var MySQLStore = require('express-mysql-session')(session);
  var bodyParser = require('body-parser');
  
  var app = express();
  app.set('view engine', 'jade');
  app.set('views', './views/mysql');
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(session({
    secret: '1234DSFs@adf1234!@#$asd',
    resave: false,
    saveUninitialized: true,
    store:  new MySQLStore({
        host     : 'sql12.freemysqlhosting.net',
        user     : 'sql12203503',
        port: 3306,
        password : '3KBnnfJwFj',
        database : 'sql12203503'
      })
  }));
 return app;
}
