var Db = require('../db/db');

var User = require('../models/user');
var userDb = require('../db/interface/userDb');

var Message = require('../models/message');
var MessageDb = require('../db/interface/messageDb');

var Status = require('../models/status');
var StatusDb = require('../db/interface/statusDb');

var Announcement = require('../models/announcement');
var AnnouncementDb = require('../db/interface/announcementDb');

var Person = require('../models/person');

var pw = require('../models/password');
var config = require('../config');


//* USERS *//
exports.getUsers = function(req,res,next){
  var db = new Db();
  var userDbInst = new userDb();

  db.start(function(connection){
    //Get all users
    userDbInst.getAllUsers(function(err, user_list){
      db.close(connection, function(ret){
        res.send({user_list: user_list});
      });
    });
  });
};

exports.postUsers = function(req,res,next){
  var rb = req.body;
  var client = {username: rb.username,
                password: rb.password,
                status: 0,
                type: 0
               };
  var isCreate = rb.isCreate;

  var userModel = new User();
  var db = new Db();

  db.start(function(connection){
    userModel.validate(client, isCreate, function(err, err_list, matchedUser){
      db.close(connection,function(ret){
        if(err) {
          res.status(err_list.httpCode).send({errors: err_list});
        } else {
          var sess = req.session;
          if(err_list.httpCode==200 || err_list.httpCode==201) {
            sess.username = req.body.username;
            if(err_list.httpCode==201) {
              userModel.addUser(client, function(err, newUser, user_list) {
                if(err) {
                }
                else {
                }
              });
            }
          }
          res.status(err_list.httpCode).send({errors: err_list});
        }
      });
    });
   });
};

exports.getUserProfile = function(req,res,next){
  var db = new Db();
  var userDbInst = new userDb();

  db.start(function(connection){
    userDbInst.getUserByName(req.params.username, function(err, user){
      db.close(connection, function(ret){
        if(err){
          res.sendStatus(500);
        } else {
          if(user == null)
            res.status(404).send();
          else
            res.status(200).send({ user: user });
        }
      });
    });
  });
};

exports.getStatusCrumbs = function(req,res,next){
  var db = new Db();
  db.start(function(connection){
    var statusDbInst = new StatusDb();
    statusDbInst.getStatusCrumbs(req.params.username, function(err, crumbs){
      db.close(connection, function(ret){
        if(err){
        } else {
          crumbs.sort(function(a,b){
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
          res.status(200).send({crumbs: crumbs});
        }
      })
    });
  });
}

exports.postStatusCrumb = function(req,res,next){
  var r = req.params;
  var db = new Db();

  db.start(function(connection){
    var userModel = new User();
    var userInfo = {username: r.username,
                    password: "abcd", //Password doesn't matter, since we're not adding user to database
                    status: r.statusCode,
                    type: 0
                   };

    userModel.updateStatus(userInfo, function(err) {
       if(err) {
       }
       else {
          db.close(connection, function(err) {
             if(err) {
             }
             else {
                res.status(201).send({statusCode: r.statusCode});
             }
          });
       }
    });
  });
}

//* MESSAGES *//
exports.getPublicMessages = function(req,res,next){
  var db = new Db();
  var messageDbInst = new MessageDb();

  db.start(function(connection){
    //Get last 100 messages
    messageDbInst.getMessages(function(success, message_list){
      db.close(connection, function(ret){
        if(success)
          res.status(200).send({
            message_list: message_list,
          });
      });
    });
  });
};

exports.postNewMessage = function(req,res,next){
  var db = new Db();
  var message = new Message(req.body.messageData, req.body.author, req.body.receiver,
      req.body.postedAt, req.body.messageType, req.body.latitude, req.body.longitude, req.body.city, 0, req.body.attachment);

  message.saveMessage(function(err, message){
    if (err){
    } else {
      //message saved
      res.status(201).send({message: message});
      }
  });
};

exports.getPrivateMessages = function(req,res,next){
  var db = new Db();
  var userDbInst = new userDb();
  var messageDbInst = new MessageDb();

  //start db connection
  db.start(function(connection){
    //Get user_list and get last 100 messages
    messageDbInst.getMessagesBetween(req.params.author,req.params.receiver,function(success, message_list){
      userDbInst.getUserByName(req.params.receiver, function(err, receiver_user){
        db.close(connection, function(ret){
          if(err){
            res.sendStatus(500);
          } else if(receiver_user == null){
            res.sendStatus(404);
          } else {
            res.status(200).send({
              author : req.params.username,
              username : req.params.username,
              receiver: req.params.receiver,
              message_list: message_list,
            });
          }
        });
      });
    });
  });
}

exports.getAnnouncements = function(req,res,next){
  var db = new Db();
  var annDbInst = new AnnouncementDb();

  //start db connection
  db.start(function(connection){
    //Get last 100 messages
    annDbInst.getAnnouncements(function(success, announcement_list){
      db.close(connection, function(ret){
        var justCreated = req.param('justCreated');
        if(success)
          res.status(200).send({
            announcement_list: announcement_list,
          });
      });
    });
  });
}

exports.postAnnouncements = function(req,res,next){
  var announcement = new Announcement(req.body.annData, req.body.author, req.body.postedAt ,req.body.latitude, req.body.longitude, req.body.city);
  announcement.saveAnnouncement(function(err, announcement){
    if (err){
      res.sendStatus(404);
    } else {
      res.sendStatus(201);
    }
  });
}

exports.searchData = function(req,res,next){
  var db = new Db();
  var users;
  var stopwords = /(\ba\b|\bable\b|\babout\b|\bacross\b|\bafter\b|\ball\b|\balmost\b|\balso\b|\bam\b|\bamong\b|\ban\b|\band\b|\bany\b|\bare\b|\bas\b|\bat\b|\bbe\b|\bbecause\b|\bbeen\b|\bbut\b|\bby\b|\bcan\b|\bcannot\b|\bcould\b|\bdear\b|\bdid\b|\bdo\b|\bdoes\b|\beither\b|\belse\b|\bever\b|\bevery\b|\bfor\b|\bfrom\b|\bget\b|\bgot\b|\bhad\b|\bhas\b|\bhave\b|\bhe\b|\bher\b|\bhers\b|\bhim\b|\bhis\b|\bhow\b|\bhowever\b|\bi\b|\bif\b|\bin\b|\binto\b|\bis\b|\bit\b|\bits\b|\bjust\b|\bleast\b|\blet\b|\blike\b|\blikely\b|\bmay\b|\bme\b|\bmight\b|\bmost\b|\bmust\b|\bmy\b|\bneither\b|\bno\b|\bnor\b|\bnot\b|\bof\b|\boff\b|\boften\b|\bon\b|\bonly\b|\bor\b|\bother\b|\bour\b|\bown\b|\brather\b|\bsaid\b|\bsay\b|\bsays\b|\bshe\b|\bshould\b|\bsince\b|\bso\b|\bsome\b|\bthan\b|\bthat\b|\bthe\b|\btheir\b|\bthem\b|\bthen\b|\bthere\b|\bthese\b|\bthey\b|\bthis\b|\btis\b|\bto\b|\btoo\b|\btwas\b|\bus\b|\bwants\b|\bwas\b|\bwe\b|\bwere\b|\bwhat\b|\bwhen\b|\bwhere\b|\bwhich\b|\bwhile\b|\bwho\b|\bwhom\b|\bwhy\b|\bwill\b|\bwith\b|\bwould\b|\byet\b|\byou\b|\byour\b)/gi;
  var filteredKeyword = req.query.keyword.replace(stopwords, "");
  var statusVal = -1;

  if (filteredKeyword.toLowerCase() === "undefined") statusVal = 0;
  else if (filteredKeyword.toLowerCase() === "ok") statusVal = 1;
  else if (filteredKeyword.toLowerCase() === "help") statusVal = 2;
  else if (filteredKeyword.toLowerCase() === "emergency") statusVal = 3;

  //start db connection
  db.start(function(connection){

    // The below if is for loading 10 more public messages. Will work on this later.
    if(req.query.more=="public"){
      Message.searchMessagesBy(req.query.username,filteredKeyword,1,req.query.lastTime,function(message_list){
          db.close(connection, function(ret){
          res.status(201).send(message_list);
          });
        });
    }
    else if(req.query.more=="private"){
      Message.searchMessagesBy(req.query.username,filteredKeyword,2,req.query.lastTime,function(message_list2){
          db.close(connection, function(ret){
          res.status(201).send(message_list2);
          });
        });
    }
    else if(req.query.more=="ann"){
      Announcement.searchDBAnnouncementsBy(filteredKeyword, req.query.lastTime, function(success, announcement_list){
        db.close(connection, function(ret){
          res.status(201).send(announcement_list);
          });
      });
    }
    else

    // Normal case, return everything.
    Announcement.searchDBAnnouncementsBy(filteredKeyword, "", function(success, announcement_list){
      User.getMatchingUsers(filteredKeyword,function(err, user_list){
        Message.searchMessagesBy(req.query.username,filteredKeyword,0,"",function(message_list, message_list2){

          User.getMatchingUsersWithStatus(statusVal,function(err, status_list){
            db.close(connection, function(ret){
              res.render('search',{
                author: req.query.username,
                username: req.query.username,
                user: null,
                user_list: user_list,
                announcement_list: announcement_list,
                message_list: message_list,
                message_list2: message_list2,
                status_list: status_list,
                keyword: filteredKeyword,
              });
            });
          });
        });
      });
    });
  });
};

exports.getMissingPeople = function(req, res, next) {
    var db = new Db();
    //start db connection
    db.start(function(connection){
      Person.getAllPersons(function(err, person_list){
        db.close(connection, function(ret){
           res.status(200).send(person_list);
        });
      });
    });
};

exports.addMissingPerson = function(req, res, next) {
   var body = req.body;
   var db = new Db();

   db.start(function(connection){
      Person.isValidData(body.firstName,body.lastName,body.age,body.location, body.relationship, function(success){
        if(!success) {
          db.close(connection, function(err) {
            res.status(401).send({});
          });

        }
        else {
        Person.samePersonExists(body.firstName,body.lastName,body.age,function(err,person){
          if(err) {

          }
          else {
            if (person !== null) {
                db.close(connection, function(err) {
                   res.status(422).send({});
                });
            }
            else {
              var personModel = new Person(body.firstName,body.lastName,body.age,body.location,req.params.reporter,body.relationship);
              personModel.savePerson(function(err,person) {
              if(err) {
              }
              else {
                db.close(connection, function(err) {
                  if(err) {
                  }
                  else {
                     if (person !== null){
                       res.status(201).send({person: person});
                     }
                     else {
                       res.status(422).send({});
                     }
                  }
                });
              }
            });
            }
          }
        });
        }
      });
   });
};

exports.changeMissingStatus = function(req, res, next) {
   //see if user is logged in
   var db = new Db();
   //start db connection
   db.start(function(connection){
   Person.changeStatus(req.body.personId, req.params.foundByUser, function(err, person){
     db.close(connection, function(ret){
       res.status(201).send({person:person});
     });
   });

   });
};

function closeDb(db, connection, res, errList) {
    db.close(connection, function(err) {
      if(err) {
      }
      else {
        res.status(errList.httpCode).send({errors: errList});
      }
    });
}

function updateUsernameInMessages(old_username, new_username, callback){
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
    } else if(req.body.newPassword){
      var decrypted_pw = req.body.newPassword;
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
            errList.httpCode = 200;
          } else {
            errList.httpCode = 500;
          }
          closeDb(db, connection, res, errList);
        });
      });

    }
}
