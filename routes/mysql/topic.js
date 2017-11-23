module.exports = function(){
  var json = require('json');
  var route = require('express').Router();
  var con = require('../../config/mysql/db')();

  // route.get('/booknow', function (req,res) {
  //     res.render('booknow');
  // });

  route.post('/add', function(req,res){
    var user = req.user.authId;
    //var contactMethod = req.body.contact;
    var packageType = req.body.lengthOfStay;
    var departure = req.body.departure;
    var airport = req.body.airport;
    var email = req.user.email;
    var dDate = req.body.dDate;
    var price = req.body.totalCost;
    var passangers = [];
    for (var i=0; i<req.body.talent;i++){
      passangers.push([eval("req.body.pname" + i.toString()),
       eval("req.body.dob" + i.toString()), eval("req.body.passportid" + i.toString())]);
    };
    var sql = `INSERT INTO package (userId, packageType, departure, passangers, email, airport, price)
     VALUES(?, ?, ?, ?, ?, ?, ?)`;
    con.query(sql, [user, packageType, dDate, passangers.toString(), email, airport, price],
       function(err, result, fields){
      if(err){
        res.status(500).send('Internal Serval Error');
        console.log(err);
      }else{
        res.redirect('/topic/' + result.indertId);
      }
    });
  });

  //edit
  route.get(['/:id/edit'], function(req, res){
    var sql = 'SELECT id FROM package';
    con.query(sql, function(err, topics, fields){
      var id = req.params.id;
      if (id){
        var sql = 'SELECT * FROM package WHERE id=?';
        con.query(sql, [id], function(err, topic, fields){
          if (err){
            console.log(err);
            res.status(500).send('Internal Serval Error');
          } else {
            res.render('topic/edit', {topics:topics, topic:topic[0], user:req.user});
          }
        });
      }else{
        console.log('There is no id');
        res.status(500).send('Internal Serval Error');
      }
    });
  });

  route.post(['/:id/edit'], function(req, res){
    var title = req.body.title;
    var description = req.body.description;
    var author = req.body.author;
    var id = req.params.id;
    var sql = 'UPDATE topic SET title=?, description=?, author=? WHERE id=?';
    con.query(sql, [title, description, author, id], function (err, result, fields) {
      if (err){
        console.log(err);
        res.status(500).send('Internal Serval Error');
      } else {
        res.redirect('/topic/'+id);
      }
    });
  });

  //delete
  route.get(['/:id/delete'], function(req, res){
    var sql = 'SELECT * FROM package';
    var id = req.params.id;
    con.query(sql, function(err, topics, fields){
      var sql = 'SELECT * FROM package WHERE id=?';
      con.query(sql, [id], function(err, topic){
        if (err){
          console.log(err);
          res.status(500).send('Internal Serval Error');
        } else {
          if(topic.length === 0){
            console.log('There is no record');
            res.status(500).send('Internal Serval Error');
          }else{
          res.render('topic/delete', {topics:topics, topic:topic[0], user:req.user});
          }
        }
      });
    });
  });

  route.post('/:id/delete', function(req, res){
    var id = req.params.id;
    var sql = 'DELETE FROM package WHERE id=?';
    con.query(sql, [id], function(err, result){
      res.redirect('/topic/');
    });
  });


  route.get(['/', '/:id'], function(req, res){
    if (req.user){
    var sql = 'SELECT id,passangers,userId FROM package WHERE userId = ?';
    con.query(sql, [req.user.authId], function(err, topics, fields){


        var id = req.params.id;
        if (id){
          var sql = 'SELECT * FROM package WHERE id=?';
          con.query(sql, [id], function(err, topic, fields){
            if (err){
              console.log(err);
              res.status(500).send('Internal Serval Error');
            }else{
              res.render('topic/view', {topics:topics, topic:topic[0], user:req.user});
            }
          });
        }else{
          res.render('topic/view', {topics:topics, user:req.user,});
        }
    });
  }else{
    res.render('../../views/mysql/auth/login', {message:"PLease login first"});
  }

  });
  return route;
}
