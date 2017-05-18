var mongoose = require('mongoose');
var Db = require('../db/db');
var User = require('../models/user');
var Announcement = require('../models/announcement');
var Message = require('../models/message');
var Status = require('../models/status');
var pw = require('../models/password');
var config = require('../config');
var CryptoJS = require('crypto-js');
var Group = require('../models/group');
var Promise = require('bluebird');

function isOnline(obj){
  return (obj.onlineStatus === 0);
}

function isOffline(obj){
  return (obj.onlineStatus == 1);
}

/* Retrieve all users */
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
};

exports.updateUserProfile = function(req, res, next){

  if(!req.session.username) {
    res.redirect(302, '/');
  }
  else {
    var db = new Db();
    var userModel = new User();
    var body = req.body;


    db.start(function(connection){
      userModel.updateUserProfile(req.params.username,body.name,body.dob,body.sex,body.address,
      body.phone,body.email,body.conditions,body.allergies,body.drugs,body.emerName, body.emerPhone, body.emerEmail, function(err,success){
          db.close(connection, function(ret){
            if(err){
              res.status(500);
            } else {
              console.log("in routes updateUserProfile");
              res.sendStatus(201);
            }
          });
      });
    });
  }
};

/* Register/Login a user */
exports.postNewUser = function(req, res, next){
    var db = new Db();
    var rb = req.body;
    var sess = req.session;

    var userInfo = {username: rb.username,
                    password: pw.decrypt(rb.ciphertext, rb.key, rb.iv),
                    status: 0,
                    type: 0
                   };

    var isCreate = rb.isCreate;
    var io = req.app.get('io');

    var userModel = new User();
    db.start(function(connection){
      userModel.validate(userInfo, isCreate, function(err, err_list, matchedUser){
        if(err) {
          closeDb(db, connection, res, err_list);
        } else {
          if(err_list.httpCode==201){
            userModel.addUser(userInfo, function(err, newUser, user_list) {
              if(err) {
                closeDb(db, connection, res, err_list);
              }
              else {
                // Add Public and Info Group
                var defaultGroups = ["Public", "Info"];
                Promise.each(defaultGroups, function(groupName) {
                  var group = new Group(groupName);
                  return group.addGroupMember(newUser.username)
                }).then(() => {
                  var onlineUsers = user_list.filter(isOnline);
                  var offlineUsers = user_list.filter(isOffline);

                    setSessionInfo(sess, newUser);

                  // sort by alphabetical order
                  onlineUsers.sort(function (a, b) {
                    return a.username.localeCompare(b.username);
                  });
                  offlineUsers.sort(function (a, b) {
                    return a.username.localeCompare(b.username);
                  });
                  user_list = onlineUsers.concat(offlineUsers);
                  if (io)
                    io.emit('new_user_for_chat', user_list);

                  closeDb(db, connection, res, err_list);
                });
              }
            });
          }
          else if(err_list.httpCode==200) {
            setSessionInfo(sess, matchedUser);
            closeDb(db, connection, res, err_list);
          }
          else {
            closeDb(db, connection, res, err_list);
          }
        }
      });
    });
};

function setSessionInfo(sess, curUser) {
    sess.user = curUser;
    // do not store _id and password in session
    sess.user._id = undefined;
    sess.user.password = undefined;
    sess.test = curUser.username;
    sess.username = curUser.username;
    sess.notify_list =[false, false];
    sess.haveread = false;
    sess.userchatlist = "";
}

function closeDb(db, connection, res, errList) {
    db.close(connection, function(err) {
      if(err) {
      }
      else {
        res.status(errList.httpCode).send({errors: errList});
      }
    });
}

exports.getProfile = function(req, res, next){

  if(!req.session.username) {
    res.redirect(302, '/');
  }
  else {
    res.render('profile', {
      username: req.session.user.username,
      user: req.session.user
    });
  }
};

exports.getUserProfile = function(req, res, next){

  if(!req.session.username) {
    res.redirect(302, '/');
  }
  else {
    var db = new Db();
    var userModel = new User();

    db.start(function(connection){
      userModel.getUserByName(req.params.username, function(err, user){
        User.getAllUsers(function(err2, user_list){
          db.close(connection, function(ret){
            if(err || err2){
              res.status(500);
            } else {
              if(user === null)
                res.render('fourohfour', {
                  err_msg: "You shouldn't be here."
                });
              else{
                var salt = pw.createRandomString(10);
                res.render('profile', {
                  username: req.session.user.username,
                  user: req.session.user,
                  profile: user,
                  requiresBottomNav: true,
                  user_list: user_list,
                  salt: salt
                });
              }
            }
          });
        });
      });
    });
  }
};

/* Administer a profile, need to retrieve list of all existing users */
exports.adminProfile = function(req, res, next){
  if(!req.session.username || req.session.user.type != 1) {
    res.redirect(302, '/');
  }
  else {
    var db = new Db();
    var userModel = new User();

  db.start(function(connection){
    User.getAllUsers(function(err, user_list){
      db.close(connection, function(ret){
        if(err){
          res.status(403);
        } else {
          var salt = pw.createRandomString(10);
          res.render('admin_profile', {
            username: req.session.user.username,
            user: req.session.user,
            user_list: user_list,
            salt: salt
          });
        }
      });
    });
  });
}
}

addAdmin = function(userModel, callback){
  //preset admin user definition
  var admin = {
    username: 'ESNAdmin',
    password: 'admin',
    status: 1,
    type: 1
  }
  userModel.addUser(admin, function(err, user){
    if(err){
      callback(false);
    } else {
      callback(true);
    }
  });
}

exports.checkAdmin = function(callback){
  var db = new Db();
  var userModel = new User();
  db.start(function(connection){
    userModel.getUserByName('ESNAdmin', function(err, user){
      if(err){
        db.close(connection, function(ret){
          callback(false, 'db user when getting admin user');
        });
      } else if (!user) {
        this.addAdmin(userModel, function(success){
          db.close(connection, function(ret){
            if(success){
              callback(true, "admin user added");
            } else {
              callback(false, "admin does not exist, failed to add admin user");
            }
          });
        });
      } else {
        db.close(connection, function(ret){
          callback(true, 'admin user already exists');
        });
      }
    });
  });
}

updateUsernameInMessages = function(old_username, new_username, callback){
  Announcement.updateAnnouncementWithNewUsername(old_username, new_username, function(err1){
    Message.updateMessageWithNewUsername(old_username, new_username, function(err2, err3){
      Status.updateStatusCrumbsWithNewUsername(old_username, new_username, function(err4){
        if(!err1 && !err2 && !err3 && !err4){
          callback();
        } else {
          callback([err1, err2, err3, err4]);
        }
      });
    });
  });
}

exports.updateProfile = function(req, res, next){
  if (req.session.user.type != 1){
    res.sendStatus(403);
  } else {
    var db = new Db();
    var userModel = new User();
    // One and only one of the following will happen per call of this function.
    var errList = {
      httpCode: 200,
      usernameLenInvalid: false,
      passwordLenInvalid: false,
      usernameBanned: false
    };

    if(req.body.newUsername){
      //Notes:
      //Assuming the db will be closed by calling "closeDb(db, connection, res, err_list);" as in above functions (like line 100)
      //If new username length<3, the 'errList.usernameLenInvalid' should be assigned 'true' (do this in /models/user.js)
      //If new username is banned, the 'err_list.usernameBanned' should be assgined 'true'
      //Because err_list will be checked by front end js to give warnings

      //check if the new username is valid
      if(userModel.userInputInvalid(req.body.newUsername, "12345", errList)){
        res.status(errList.httpCode).send({errors: errList});
      } else {
        db.start(function(connection){
          userModel.updateUser({username: req.body.newUsername}, req.body.username, function(err, success){
            updateUsernameInMessages(req.body.username, req.body.newUsername, function(err){
              if(err || !success){
                errList.httpCode = 500;
                closeDb(db, connection, res, errList);
              } else {
                errList.httpCode = 200;
                closeDb(db, connection, res, errList);
              }
            });
          });
        });
      }
    } else if(req.body.ciphertext){
      var decrypted_pw = pw.decrypt(req.body.ciphertext, req.body.key, req.body.iv);
      var new_pw = pw.createDBPassword(decrypted_pw);

      //Notes:
      //If new password length<4, the 'err_list.passwordLenInvalid' should be assigned 'true'
      //check if the new password is valid
      if(userModel.userInputInvalid("johnsnow", decrypted_pw, errList)){
        res.status(errList.httpCode).send({errors: errList});
      } else {
        db.start(function(connection){
          userModel.updateUser({password: new_pw}, req.body.username, function(err, success){
            if(success){
              errList.httpCode = 200;
            } else {
              errList.httpCode = 500;
            }
            closeDb(db, connection, res, errList);
          });
        });
      }
    } else if(req.body.newPrivilege){

      db.start(function(connection){
        userModel.updateUser({type: req.body.newPrivilege}, req.body.username, function(err, success){
          if(success){
            errList.httpCode = 200;
          } else {
            errList.httpCode = 500;
          }
          closeDb(db, connection, res, errList);
        });
      });

    } else if(req.body.wantActivate){

      db.start(function(connection){
        userModel.updateUser({accountStatus: 0}, req.body.username, function(err, success){
          if(success){
            errList.httpCode = 200;
          } else {
            errList.httpCode = 500;
          }
          closeDb(db, connection, res, errList);
        });
      });

    } else if(req.body.wantDeactivate){
      var io = req.app.get('io');

      db.start(function(connection){
        userModel.updateUser({accountStatus: 1}, req.body.username, function(err, success){
          if(success){
            if(req.app.get('env') != 'test'){
              io.emit('user_deactivate', req.body.username);
            }
            errList.httpCode = 200;
          } else {
            errList.httpCode = 500;
          }
          closeDb(db, connection, res, errList);
        });
      });
    }
  }
}