
module.exports = function(){
  var mysql = require('mysql');
  var con = mysql.createConnection({
    host     : 'sql12.freemysqlhosting.net',
    user     : 'sql12203503',
    port : 3306,
    password : '3KBnnfJwFj',
    database : 'sql12203503'

  });
  con.connect();
  return con;
}
