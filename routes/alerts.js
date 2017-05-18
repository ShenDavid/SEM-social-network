var Db = require('../db/db');
var Alert = require('../models/alert');

// exports.testRoute = function(req, res, next) {
//   console.log("Alerts Test Route");
//   console.log(req.body.groupName);
//   console.log(req.body.alertClass);
//   var io = req.app.get('io');
//   io.emit('test_alert', req.body.groupName, req.body.alertClass);
//   res.status(200);
// };

// exports.checkUser = function(req, res, next){
//   console.log("in checkUser");
//   console.log(req.body.groupName);
//   res.status(200);
// };

exports.showAlertPage = function(req, res, next) {
  var sess = req.session;
  console.log("Showing Alert Page");
  res.render('alertIncoming', {
    username : sess.username,
    user : sess.user,
    groupName: req.params.groupName,
    alertClass: req.params.alertClass
  });
};

exports.newAlert = function(req, res, next) {
  var db = new Db();
  if (!req.session.username){
    res.redirect(302, '/');
  } else {
    var alert = new Alert(req.session.username, req.body.groupName, req.body.alertClass);
    var io = req.app.get('io');

    db.start(function(connection) {
      alert.saveAlert(function(status, alert){
        if (status==500){
          res.status(500).send({error: status});
        } else {
          //alert saved
          db.close(connection, function(err) {
            if(err) {
            }
            else {
              res.status(status).send({alert: alert});
            }
          });
        }
      });
    });
    io.emit('new_Alert', req.session.username, req.body.groupName, req.body.alertClass);
  }

};



/*var User = require('../models/user');
var userDb = require('../db/interface/userDb')
var Message = require('../models/message');
var MessageDb = require('../db/interface/messageDb');
var config = require('../config');
var Group = require('../models/group');


exports.postNewMessage = function(req, res, next){
  var db = new Db();
  if (!req.session.username){
    res.redirect(302, '/');
  } else {
    var userStatus = req.session.user.status;
    // var msgStatus = "OK";
    // if(userStatus==2)msgStatus="Help";
    // else if(userStatus==3)msgStatus="Emergency";

    var message = new Message(req.body.messageData, req.body.author, req.body.receiver, req.body.postedAt, req.body.messageType, req.body.latitude, req.body.longitude, req.body.city, userStatus, req.body.attachment);
    var io = req.app.get('io');
    db.start(function(connection) {
      message.saveMessage(function(status, message){
        if (status==500){
          res.status(500).send({error: status});
        } else {
          //message saved
          io.emit('broadcast_message', message, req.body.author, req.body.receiver);
          io.emit('notify_message', req.body.author, req.body.receiver);  // Only for notification. Actual content need not be sent again.
          db.close(connection, function(err) {
            if(err) {
            }
            else {
              res.status(status).send({message: message});
            }
          });
        }
      });
    });
  }
};


exports.getAllUsers = function(req, res, next) {
  //see if user is logged in
  if (!req.session.username){
    res.redirect(302, '/');
  } else {
    var db = new Db();

    //start db connection
    db.start(function(connection){
      //Get all users
      User.getAllUsers(function(err, user_list){
        if(err) {
        }
        else {
          db.close(connection, function(ret){
            res.render('directory', {
              username: req.session.username,
              user: req.session.user,
              user_list: user_list,
            });
          });
        }
      });
    });
  }
};*/