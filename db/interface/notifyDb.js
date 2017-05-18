'use strict';

var mongoose = require('mongoose');
var user = require('../schema/user.js');
var pw = require('../../models/password.js');

var NotifyModel = mongoose.model('Notify', notify.notifySchema);

class userDb {
	constructor(){
	}

  findNotify(username, callback){
    NotifyModel.findOne({'username': username}, function(err, notify){
      callback(err, notify);
    });
  }

  addNotify(username, callback){
    var notify = new NotifyModel();
    notify.username = username
    user.save(function(err){
      callback(err, notify);
    });
  }

}

module.exports = notifyDb;
