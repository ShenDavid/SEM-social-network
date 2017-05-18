'use strict';

var mongoose = require('mongoose');
var status = require('../schema/status.js');

var statusModel = mongoose.model('status', status.statusSchema);

class statusDb {
	constructor(){
	}

	addStatus(data, callback){
   var status = new statusModel();
   status.username = data.username;
   status.statusCode = data.statusCode;
   status.save(function(err){
     callback(err, status);
   });
 }

 getStatusCrumbs(username, callback){
  statusModel.find({username: username}).sort({date:1}).exec(function(err, crumbs){
    callback(err, crumbs);
  });
}

updateStatusCrumbUsername(old_username, new_username, callback){
  statusModel.find({'username': old_username}, function(err, status_list){
      //if error exists
        //no error but messages may be empty
        if(!status_list){
          callback(err);
        }
        //if not empty then change all the names to the new username
        for(var i = 0; i < status_list.length; i++){
          status_list[i].username = new_username;
          status_list[i].save(function(err, record, numAffect){
            //if there is an error in saving the new username
            if(err){
              callback(err);
            }
          });
        }
        //else return that there were no errors
        callback(err);

      });
}

deleteStatusCrumbsByUser(username, callback){
  statusModel.find({username: username}).remove(function(err) {
    callback(err);
  });
}

}

module.exports = statusDb;
