'use strict';

var mongoose = require('mongoose');
var message = require('../schema/message.js');

var MessageModel = mongoose.model('Message', message.messageSchema);

class messageDb {
  constructor(){
  }
  addMessage(data, callback){
    console.log(data.attachment);
    var message = new MessageModel();
    message.messageData = data.messageData;
    message.author = data.author;
    message.receiver = data.receiver;
    message.currStatus = data.currStatus;
    message.postedAt = data.postedAt;
    message.receiver = data.receiver;
    message.city = data.city;
    message.latitude = data.latitude;
    message.longitude = data.longitude;
    if (data.attachment) {
      message.attachment = data.attachment;
    }

    message.save(function(err){
      console.log(err);
      callback(err, message);
    });
  }

  getMessages(callback){
    var getAllMessages = MessageModel.find({'receiver':'PM'});
    getAllMessages.sort('postedAt').limit(100).exec(function(err, messages){
      if (err){
        callback(false, null);
      } else if (messages.length == 0){
        callback(true, null);
      } else {
        callback(true, messages);
      }
    });
  }

  getGroupMessages(groupName, callback){
    var getAllMessages = MessageModel.find({'receiver':groupName});
    getAllMessages.sort('postedAt').limit(100).exec(function(err, messages){
      if (err){
        callback(false, null);
      } else if (messages.length == 0){
        callback(true, null);
      } else {
        callback(true, messages);
      }
    });
  }

  searchPublicMessagesBy(keyword, lastTime, callback){
    var getAllMessages;
    if(lastTime=="")
      getAllMessages = MessageModel.find({'receiver':'PM', 'messageData':  {'$regex' : keyword}});
    else
      getAllMessages = MessageModel.find({'postedAt':{$lt:lastTime}, 'receiver':'PM', 'messageData':  {'$regex' : keyword}});
    getAllMessages.sort({'postedAt':-1}).limit(10).exec(function(err, messages){
      if (err){
        callback(false, null);
      } else if (messages.length == 0){
        callback(true, null);
      } else {
        callback(true, messages);
      }
    });
  }

  checkAfter(timeLogOut, me, callback){
    var getUnreadMessages = MessageModel.find({$and:[{'postedAt':{$gte:timeLogOut}}, {$or:[{'receiver':me},{'receiver':'PM'}]}]});
    getUnreadMessages.limit(100).exec(function(err, messages){
      var unread;
      if (messages.length == 0){
        unread = 0;
        callback(true, unread, messages);
      } else {
        unread = 1;
        callback(true, unread, messages);
      }
    });
  }

  getMessagesBetween(author,receiver,callback){
    var getPrivateMessages = MessageModel.find({ $or: [ {'author':author,'receiver':receiver}, {'author':receiver,'receiver':author} ] });
    getPrivateMessages.sort('postedAt').limit(100).exec(function(err, messages){
      if (messages.length == 0){
        callback(true, null);
      } else {
        callback(true, messages);
      }
    });
  }

  searchPrivateMessagesBy(keyword, author, lastTime, callback){
    var getPrivateMessages;
    if(lastTime=="")
      getPrivateMessages = MessageModel.find({ $or: [ {'author':author, 'receiver':{$ne:'PM'}, 'messageData':  {'$regex' : keyword}}, {'receiver':author, 'messageData':  {'$regex' : keyword}} ] });
    else
      getPrivateMessages = MessageModel.find({ $or: [ {'postedAt':{$lt:lastTime}, 'author':author, 'receiver':{$ne:'PM'}, 'messageData':  {'$regex' : keyword}}, {'postedAt':{$lt:lastTime}, 'receiver':author, 'messageData':  {'$regex' : keyword}} ] });
    getPrivateMessages.sort({'postedAt':-1}).limit(10).exec(function(err, messages){
      if (messages.length == 0){
        callback(true, null);
      } else {
        callback(true, messages);
      }
    });
  }

  deleteMessage(messageText, author, receiver, callback) {
    MessageModel.find({'messageData':messageText,'author':author, 'receiver':receiver}).remove(function(err) {
      callback(err);
    });
  }

  updateMessageAuthor(old_username, new_username, callback){
    MessageModel.find({'author': old_username}, function(err, msg_list){
      //if error exists
      if(err){
        callback(err);
      } else {
        //no error but messages may be empty
        if(!msg_list){
          callback(err);
        }
        //if not empty then change all the names to the new username
        for(var i = 0; i < msg_list.length; i++){
          msg_list[i].author = new_username;
          msg_list[i].save(function(err, record, numAffect){
            //if there is an error in saving the new username
            if(err){
              callback(err);
            }
          });
        }
        //else return that there were no errors
        callback(err);
      }
    });
  }

  updateMessageReceiver(old_username, new_username, callback){
    MessageModel.find({'receiver': old_username}, function(err, msg_list){
      //if error exists
      if(err){
        callback(err);
      } else {
        //no error but messages may be empty
        if(!msg_list){
          callback(err);
        }
        //if not empty then change all the names to the new username
        for(var i = 0; i < msg_list.length; i++){
          msg_list[i].receiver = new_username;
          msg_list[i].save(function(err, record, numAffect){
            //if there is an error in saving the new username
            if(err){
              callback(err);
            }
          });
        }
        //else return that there were no errors
        callback(err);
      }
    });
  }

  deleteAllMessagesByUser(username, callback) {
    MessageModel.find({'author':username}).remove(function(err) {

      MessageModel.find({'receiver':username}).remove(function(err) {
       callback(err);
     });
      
    });
  }
}

module.exports = messageDb;
