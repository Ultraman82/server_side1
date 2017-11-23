var app = require('./config/mysql/express')();
var stripe = require("stripe")("sk_test_vTimLKH7Ln6IoZPQ2SWF0vge");
var passport = require('./config/mysql/passport')(app);
var auth = require('./routes/mysql/auth')(passport);
app.use('/auth/', auth);

app.get('/',function (req,res) {
  res.render('home', {user:req.user});
  });

var con = require('./config/mysql/db')();

app.get('/booknow/',function (req,res) {
  if (req.user){
    res.render('booknow');
  } else{
    res.send(`<a href = 'auth/login'>You Need to Login first. click here`);
    }
  });


app.get('/myaccount', function(req,res){
  if(req.user){
    var sql = 'SELECT * FROM package where userId=?';
    con.query(sql, [req.user.authId], function(err, packages, fields){
    if (err){
      console.log(err);
      res.status(500).send('Internal Serval Error');
      } else {
      res.render('myaccount', {packages:packages});
      }
    });
  }else{
    res.send(`<a href = 'auth/login'>You Need to Login first`);
  }
})





app.post('/booknow', function(req,res){
  var data = {};
  data.user = req.user.authId;
  data.packageType = req.body.lengthOfStay;
  data.departure = req.body.departure;
  data.airport = req.body.airport;
  data.email = req.user.email;
  data.dDate = req.body.dDate;
  data.price = req.body.totalCost;
  data.passangers = [];
  for (var i=0; i<req.body.talent;i++){
    data.passangers.push([eval("req.body.pname" + i.toString()),
     eval("req.body.dob" + i.toString()), eval("req.body.passportid" + i.toString())]);
  };
  var sql = `INSERT INTO package (userId, packageType, departure, passangers, email, airport, price)
   VALUES(?, ?, ?, ?, ?, ?, ?)`;
  con.query(sql, [data.user, data.packageType, data.dDate, data.passangers.toString(), data.email, data.airport, data.price],
     function(err, result, fields){
    if(err){
      res.status(500).send('Internal Serval Error');
      console.log(err);
    }else{
      console.log(data);
      res.render('bookconfirm', {data:data});
    }
  });
});

app.post('/booknow/charge', function(req,res){
  var token = req.body.stripeToken;
  var chargeAmount = req.body.chargeAmount;
  console.log(chargeAmount);
  var charge = stripe.charges.create({
    amount: chargeAmount,
    currency: "usd",
    source: token
  }, function(err, charge){
    if(err){
      console.log("Your card was declined");
    }else {
      console.log("your payment was successful" + charge.toString());
      res.redirect('/');
    }
  });
});

app.listen(3003, function(){
  console.log('Connected, 3003 port!');
})
