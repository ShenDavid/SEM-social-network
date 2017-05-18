var Db = require('../db/db');
var User = require('../models/user');
var userDb = require('../db/interface/userDb')
var Bookmark = require('../models/bookmark');
var Message = require('../models/message');
var MessageDb = require('../db/interface/messageDb');
var config = require('../config');
var Group = require('../models/group');

function isOnline(obj){
  return (obj.onlineStatus === 0);
}

function isOffline(obj){
  return (obj.onlineStatus == 1);
}

function containsUser(active_users, author) {
  for (var i = 0; i < active_users.length; i++)	{
	if (active_users[i].username === author) {
	  return true;
    }
  }
  
  return false;
}

function isBookmarked(bookmark_list, message) {
  for (var i = 0; i < bookmark_list.length; i++)	{
	if (bookmark_list[i].messageData === message.messageData && bookmark_list[i].author === message.author && bookmark_list[i].receiver === message.receiver && bookmark_list[i].postedAt === message.postedAt) {
	  return true;
    }
  }
  
  return false;
}

/* Retrieve all public messages */
/* get chat publicly page */
exports.getAllPublicMessages = function(req, res, next) {
  var sess = req.session;
  
  if (!sess.username){
    res.redirect(302, '/');
  }
  else {
    var db = new Db();

    //start db connection
    db.start(function(connection){
      //Get bookmarked message list
      Bookmark.getBookmarkByUser(sess.username).then(bookmark_list => {
	      //Get user_list and get last 100 messages
	      Message.getGroupMessages("Public",function(user_list, message_list){
	        var active_users = new Array();
	
	        if(user_list){
	          user_list.sort(function (a, b) {
	            return b.username.localeCompare(a.username);
	          });
	          
	          for (var i = user_list.length - 1; i >= 0; i--) {
	            if(user_list[i].accountStatus === 0)
	              active_users.push(user_list[i]);
	          };
	        }
	        
	        if(message_list)
	          for (var i = message_list.length - 1; i >= 0; i--) {
	        	if (isBookmarked(bookmark_list, message_list[i])) {
	              message_list[i].bookmarked = true;
	        	}
	        	else {
	              message_list[i].bookmarked = false;
	        	}
	            if(!containsUser(active_users, message_list[i].author))
	              message_list.splice(i,1);
	          };
	
	          Group.getMyGroups(sess.username).then(groupList => {
	              db.close(connection, function(ret){
	              res.render('chatPublicly',{
	                author: sess.username,
	                username: sess.username,
	                receiver: "Public",
	                user_list: active_users,
	                user: sess.user,
	                message_list: message_list,
	                chatlist: sess.userchatlist,
	                grouplist : groupList,
	              });
	           });
	         });
	      });
      });
    });
  }
};

/* Retrieve all public messages */
/* get chat publicly page */
exports.getGroupMessages = function(req, res, next) {
  var sess = req.session;
  if (!sess.username){
    res.redirect(302, '/');
  }
  else {
    var db = new Db();

    //start db connection
    db.start(function(connection){
      //Get user_list and get last 100 messages
      Message.getGroupMessages(req.params.groupName,function(user_list, message_list){
        var active_users = new Array();
        
        if(user_list){
          user_list.sort(function (a, b) {
            return b.username.localeCompare(a.username);
          });
          
          for (var i = user_list.length - 1; i >= 0; i--) {
            if(user_list[i].accountStatus==0) {
              active_users.push(user_list[i].username);
            }
          };
        }
          
        if(message_list)
          for (var i = message_list.length - 1; i >= 0; i--) {
            if(active_users.indexOf(message_list[i].author)==-1)
            	message_list.splice(i,1);
          };

          Group.getMyGroups(sess.username).then(groupList => {
              db.close(connection, function(ret){
                  res.render('chatPublicly',{
                      author: sess.username,
                      username: sess.username,
                      receiver: req.params.groupName,
                      user_list: active_users,
                      user: sess.user,
                      message_list: message_list,
                      chatlist: sess.userchatlist,
                      grouplist : groupList,
                  });
              });
          });
      });
    });
  }
};

exports.getPrivateMessages = function(req, res, next) {
  var sess = req.session;
  
  if (!sess.username && !(process.env.NODE_ENV === 'test')){
    res.redirect(302, '/');
  }
  else if (sess.username != req.params.author){
    res.redirect(404, '/messages/public/');
  }
  else {
    var db = new Db();

    //start db connection
    db.start(function(connection){
      //Get user_list and get last 100 messages
      Message.getPrivateMessages(req.params.author,req.params.receiver, function(status, user_list, message_list){
        var active_users = new Array();
        
        if(user_list){
          user_list.sort(function (a, b) {
                return b.username.localeCompare(a.username);
          });
          
          for (var i = user_list.length - 1; i >= 0; i--) {
            if(user_list[i].accountStatus==0)active_users.push(user_list[i].username);
          };
        }
        
        if(message_list)
          for (var i = message_list.length - 1; i >= 0; i--) {
            if(active_users.indexOf(message_list[i].author)==-1)
            	message_list.splice(i,1);
          };

          Group.getMyGroups(sess.username).then(groupList => {
              db.close(connection, function(ret){
                  if(status==500){
                      res.status(status).send({error: status});
                  }
                  else if(status==404){
                      res.redirect(status, '/messages/public/');
                  }
                  else {
                      sess.userchatlist = sess.userchatlist.replace(req.params.receiver,'');

                  }
                  
                  res.render('chatPublicly',{
                      author: sess.username,
                      username: sess.username,
                      receiver: req.params.receiver,
                      user_list: active_users,
                      user: sess.user,
                      message_list: message_list,
                      chatlist: sess.userchatlist,
                      grouplist : groupList,
                  });
              });
          })
      });
    });
  }
};

/* Send a message */
exports.postNewMessage = function(req, res, next){
  var db = new Db();
  
  if (!req.session.username){
    res.redirect(302, '/');
  }
  else {
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