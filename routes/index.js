var User = require('../models/user');
var pw = require('../models/password');
var Db = require('../db/db');
var UserLocationDb = require('../db/interface/UserLocationDb');
var userLocationDbInst = new UserLocationDb();
var PatrolAreaDb = require('../db/interface/patrolAreaDb');
var patrolAreaDbInst = new PatrolAreaDb();

/* GET home page. */
exports.login = function(req, res, next) {
  if(req.session.username) {
    res.redirect(302, '/index');
  }
  else {
    var salt = pw.createRandomString(10);
    res.render('login',{
      salt: salt,
      deactivate: req.query.deactivate
    });
  }
};

exports.show = function(req, res, next) {
  if(!req.session.username){
    res.redirect(302, '/');
  } else {
    var justCreated = req.param('justCreated');

    res.render('index', {
      username: req.session.user.username,
      user: req.session.user,
      justCreated : justCreated
    });
  }
};

exports.logout = function(req,res,next){
  if (!req.session.username)
    res.redirect(302, '/');
  else {
    var db = new Db();
    db.start(function(connection){

      User.logout(req.session.username, function(err, success){
        userLocationDbInst.deleteLocationByUsername(req.session.username, function(err){
          patrolAreaDbInst.deleteByName(req.session.username, function(err){



        db.close(connection, function(ret){
          if(success){
            req.session.username = null;
            req.session.user = null;
            req.session.haveread = false;
            req.session.userchatlist = "";
            //request succeeded, redirect to homepage now
            if(req.query.deactivate==1)
              res.redirect(302, '/?deactivate=1');
            else
              res.redirect(302, '/');
          }
        });

      });//patrolAreaDbInst.deleteByName
      });//userLocationDbInst.deleteLocation
    });//User.logout

    });
  }
};

// exports.logout = function(req,res,next){
//   if (!req.session.username)
//     res.redirect(302, '/');
//   else {
//     var db = new Db();
//     db.start(function(connection){
//       User.logout(req.session.username, function(err, success){
//         db.close(connection, function(ret){
//           if(success){
//             req.session.username = null;
//             req.session.user = null;
//             req.session.haveread = false;
//             req.session.userchatlist = "";
//             //request succeeded, redirect to homepage now
//             if(req.query.deactivate==1)
//               res.redirect(302, '/?deactivate=1');
//             else
//               res.redirect(302, '/');
//           }
//         });
//       });
//     });
//   }
// };
