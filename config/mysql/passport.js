module.exports = function(app){
  var con = require('./db')();
  var bkfd2Password = require("pbkdf2-password");
  var passport = require('passport');
  var LocalStrategy = require('passport-local').Strategy;
  var FacebookStrategy = require('passport-facebook').Strategy;
  var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
  var hasher = bkfd2Password();
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser(function(user, done) {
    console.log('serializeUser', user);
    done(null, user.authId);
  });
  passport.deserializeUser(function(id, done) {
    console.log('deserializeUser', id);
    var sql = 'SELECT * FROM users WHERE authId=?';
    con.query(sql, [id], function(err, results){
      if(err){
        console.log(err);
        done('There is no user.');
      }else{
        done(null, results[0]);
      }

    });
  });
  passport.use(new LocalStrategy(
    function(username, password, done){
      var uname = username;
      var pwd = password;
      var sql = 'SELECT * FROM users WHERE authId=?';
      con.query(sql, ['local:'+uname], function(err, results){
        console.log(results);
        if(err){
          return done('There is no user');
        }
        var user = results[0];
          return hasher({password:pwd, salt:user.salt}, function(err, pass, salt, hash){
            if(hash === user.password){
              console.log('LocalStrategy', user);
              done(null, user);
            } else {
              done(null, false);
            }
          });
        });
    }));



    passport.use(new FacebookStrategy({
        clientID: '869646549870360',
        clientSecret: '3796eb8882371137d80ccd00ac833c51',
        callbackURL: "/auth/facebook/callback",
        profileFields:['id', 'email', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified', 'displayName']
      },
      function(accessToken, refreshToken, profile, done) {
        console.log(profile);
        var authId = 'facebook:'+profile.id;
        var sql = 'SELECT * FROM users WHERE authId=?';
        con.query(sql, [authId], function(err, results){
          if(results.length>0){
            done(null, results[0]);
          }else {
            var newuser = {
              'authId':authId,
              'displayName':profile.displayName,
              'email':profile.emails[0].value
            };
            var sql = 'INSERT INTO users SET ?';
            con.query(sql, newuser, function(err, results){
              if(err){
                console.log(err);
                dpne('Error');
              }else{
                done(null, newuser);
              }
            });
          }
        });
    }
  ));

  passport.use(new GoogleStrategy({
      clientID: "82884564442-171ujnti3sh92s1tmg6fpl222p2taems.apps.googleusercontent.com",
      clientSecret: "1eXUJtiigVF49Hqy4V-omY1K",
      callbackURL: "/auth/google/callback"
    },
    function(accessToken, refreshToken, profile, done) {
      console.log(profile);
      var authId = 'google:'+profile.id;
      var sql = 'SELECT * FROM users WHERE authId=?';
      con.query(sql, [authId], function(err, results){
        if(results.length>0){
          done(null, results[0]);
        }else {
          var newuser = {
            'authId':authId,
            'displayName':profile.displayName,
            'email':profile.emails[0].value
          };
          var sql = 'INSERT INTO users SET ?';
          con.query(sql, newuser, function(err, results){
            if(err){
              console.log(err);
              dpne('Error');
            }else{
              done(null, newuser);
            }
          });
        }
      });
  }
  ));
  return passport;
};
