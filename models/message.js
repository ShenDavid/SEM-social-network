'use strict';

var MessageDb = require('../db/interface/messageDb');
var UserDb = require('../db/interface/userDb');

class Message {
  constructor(messageData, author, receiver, postedAt, messageType, latitude, longitude, city, currStatus, attachment){

    this.messageData = messageData;
    this.author = author;
    this.receiver = receiver
    this.postedAt = postedAt;

    //if status is empty
    if(!currStatus)  this.currStatus="Undefined";
    if(currStatus==0)this.currStatus="Undefined";
    if(currStatus==1)this.currStatus = "OK";
    if(currStatus==2)this.currStatus="Help";
    if(currStatus==3)this.currStatus="Emergency";


    //if type is empty
    if(!messageType)
      this.messageType = "Chat";
    else
      this.messageType = messageType;

    //if location is empty
    if (!city) {
      this.city = "Unavailable";
      this.latitude = 0;
      this.longitude = 0;
    }
    else {
      this.city = city;
      this.latitude = latitude;
      this.longitude = longitude;
    }

    //if target is empty
    if(!receiver)
      this.receiver = "PM";
    else
      this.receiver = receiver;

    if(attachment) {
      console.log(attachment);
      this.attachment = attachment;
    }
  }

  static isOnline(obj){
    return (obj.onlineStatus === 0);
  }

  static isOffline(obj){
    return (obj.onlineStatus == 1);
  }

  saveMessage(callback) {
    var messageDbInst = new MessageDb();
    var msg = this;
    var msgData = this.messageData;
    var msgAuthor = this.author;

    messageDbInst.addMessage(msg, function(err, msData){
      if(err)
        callback(500, null);
      else
        callback(201, msData);
    });
  }

  static getAllPublicMessages(callback){
    var messageDbInst = new MessageDb();
    var userDbInst = new UserDb();
    var that = this;

    messageDbInst.getMessages(function(success, message_list){
      userDbInst.getAllUsers(function(err, user_list){
        var onlineUsers = user_list.filter(that.isOnline);
        var offlineUsers = user_list.filter(that.isOffline);

        onlineUsers.sort(function(a,b){
          return a.username.localeCompare(b.username);
        });
        offlineUsers.sort(function(a,b){
          return a.username.localeCompare(b.username);
        });
        user_list = onlineUsers.concat(offlineUsers);

        callback(user_list, message_list);
      });
    });
  }

  static getGroupMessages(groupName, callback){
    var messageDbInst = new MessageDb();
    var userDbInst = new UserDb();
    var that = this;

    messageDbInst.getGroupMessages(groupName,function(success, message_list){
      userDbInst.getAllUsers(function(err, user_list){
        var onlineUsers = user_list.filter(that.isOnline);
        var offlineUsers = user_list.filter(that.isOffline);

        onlineUsers.sort(function(a,b){
          return a.username.localeCompare(b.username);
        });
        offlineUsers.sort(function(a,b){
          return a.username.localeCompare(b.username);
        });
        user_list = onlineUsers.concat(offlineUsers);

        callback(user_list, message_list);
      });
    });
  }

  static searchMessagesBy(author, keyword, range, lastTime, callback){
    var messageDbInst = new MessageDb();
    var that = this;
    var regex =".*(";
    var strarr = keyword.split(" ");
    var i;
    for (i = 0; i < strarr.length - 1; i++) {
      if(strarr[i].length!=0)
        regex+=strarr[i]+"|";
    };
    if(strarr[i].length!=0)
      regex+=strarr[i];
    else
      regex=regex.substr(0, regex.length - 1);
    regex+=").*";
    if(range==0)  //Search both public and private
      messageDbInst.searchPublicMessagesBy(regex, lastTime, function(success, message_list){
        messageDbInst.searchPrivateMessagesBy(regex, author, lastTime, function(err, message_list2){
          callback(message_list, message_list2);
        });
      });
    if(range==1)  //search only public
      messageDbInst.searchPublicMessagesBy(regex, lastTime, function(success, message_list){
        callback(message_list);
      });
    if(range==2)  //search only private
      messageDbInst.searchPrivateMessagesBy(regex, author, lastTime, function(err, message_list2){
        callback(message_list2);
      });
  }

  static getPrivateMessages(author, receiver, callback){
    var messageDbInst = new MessageDb();
    var userDbInst = new UserDb();
    var that = this;

    messageDbInst.getMessagesBetween(author, receiver, function(success, message_list){
      if(!success) {
        callback(500, null, null);
      } else {
        userDbInst.getUserByName(receiver, function(err1, receiver_user){
          if(err1) {
            callback(500, null, null);
          } else if (receiver_user === null){
            callback(404, null, null);
          } else {
            userDbInst.getAllUsers(function(err2, user_list){
              if(err2){
                callback(500, null, null);
              } else {
                var onlineUsers = user_list.filter(that.isOnline);
                var offlineUsers =user_list.filter(that.isOffline);
                // sort by alphabetical order
                onlineUsers.sort(function(a,b){
                  return a.username.localeCompare(b.username);
                });
                offlineUsers.sort(function(a,b){
                  return a.username.localeCompare(b.username);
                });
                user_list = onlineUsers.concat(offlineUsers);

                callback(200, user_list, message_list);
              }
            });
          }
        });
      }
    });
  }

  static updateMessageWithNewUsername(old_username, new_username, callback){
    var messageDbInst = new MessageDb();
    messageDbInst.updateMessageAuthor(old_username, new_username, function(err1){
      messageDbInst.updateMessageReceiver(old_username, new_username, function(err2){
        callback(err1, err2);
      });
    });
  }

  deleteMessage(callback) {
    var messageDbInst = new MessageDb();
    messageDbInst.deleteMessage(this.messageData, this.author, this.receiver, function(err) {
      callback(err);
    });
  }

}

module.exports = Message;
