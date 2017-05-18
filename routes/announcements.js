var Db = require('../db/db');
var Announcement = require('../models/announcement');
// var AnnouncementDb = require('../db/interface/announcementDb');
var config = require('../config');
var Message = require('../models/message');
var MessageDb = require('../db/interface/messageDb');
var AnnouncementDb = require('../db/interface/announcementDb');

/* Retrieve all announcements */
/* get home page */
exports.getAllAnnouncements = function(req, res, next) {
  var sess = req.session;
  if (!sess.username){
    res.redirect(302, '/');
  } else {
    var db = new Db();
    //start db connection
    db.start(function(connection){
      //Get last 100 messages
      Announcement.getAnnouncementForRoute(sess.user.lastLogoutAt, sess.username, function(success, announcement_list, unread, messages, user_list){
        var active_users = new Array();
        if(user_list)
          for (var i = user_list.length - 1; i >= 0; i--) {
            if(user_list[i].accountStatus==0)active_users.push(user_list[i].username);
          };
        if(announcement_list)
          for (var i = announcement_list.length - 1; i >= 0; i--) {
            if(active_users.indexOf(announcement_list[i].author)==-1) announcement_list.splice(i,1);
          };
        db.close(connection, function(ret){
          var justCreated = req.param('justCreated');
            if(success){
              var io = req.app.get('io');
              var warningUnread = "";
              var userlist = [];
              var chatlist = "";
              if(!sess.haveread)
                if(unread == 1){
                  warningUnread = "You have unread messages.";
                  for (var i = messages.length - 1; i >= 0; i--) {
                    if(userlist.indexOf(messages[i].author)===-1){
                      userlist.push(messages[i].author);
                      chatlist+=messages[i].author;
                      if(i!=0)chatlist+="!!!";
                    }
                  };
                  sess.userchatlist = chatlist;
                }
                else{
                  warningUnread = "You have no unread messages.";
                }
              else
                warningUnread = "You have no unread messages.";
              sess.haveread = true;
              res.render('announcements',{
                username : sess.username,
                user : sess.user,
                announcement_list: announcement_list,
                justCreated : justCreated,
                warningUnread : warningUnread,
              });
            }
        });
      });
    });
  }
};

/* Send an announcement */
exports.postNewAnnouncement = function(req, res, next){
  var db = new Db();
  if (!req.session.username){
    res.redirect(302, '/');
  } else {
    var userType = req.session.user.type;
    if (userType == 0) {
      res.sendStatus(403);
    }
    else {
      var announcement = new Announcement(req.body.annData, req.body.author, req.body.postedAt ,req.body.latitude, req.body.longitude, req.body.city);
      var io = req.app.get('io');

      db.start(function(connection){
        announcement.saveAnnouncement(function(err, announcement){
          db.close(connection, function(ret){
            if (err){
            } else {
              req.session.notify_list[0] = true;
              //message saved
              if(io){
                io.emit('broadcast_announcement', announcement);//a new announcement
                // res.status(201).send({announcement: announcement});
                io.emit('notify_announcement', "new announcement notification"); //a new notification
              }
            }
            res.status(201).send({notify_list: req.session.notify_list});
          });
        });
      });
    }
  }
};

// Post /messages/pinAnnouncement
exports.pinAnnouncement = function(req, res, next) {
  var db = new Db();
  db.start(function(connection){
    AnnouncementDb.pinAnnouncement(req.body.annData, req.body.author, function(err){
      db.close(connection, function(ret){
        if (err) {
          res.sendStatus(500);
        }
        else {
          res.sendStatus(201);
        }
      });
    });
  });
};

// Post /messages/unpinAnnouncement
exports.unpinAnnouncement = function(req, res, next) {
  var db = new Db();
  db.start(function(connection){
    AnnouncementDb.unpinAnnouncement(req.body.annData, req.body.author, function(err){
      db.close(connection, function(ret){
        if (err) {
          res.sendStatus(500);
        }
        else {
          res.sendStatus(201);
        }
      });
    });
  });
};