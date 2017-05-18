'use strict';

var mongoose = require('mongoose');
var user = require('../schema/user.js');
var pw = require('../../models/password.js');

var UserModel = mongoose.model('User', user.userSchema);

class userDb {
	constructor(){
	}

	getUserByName(username, callback){
		UserModel.findOne({'username': username}, function(err, user){
			callback(err, user);
		});
	}

	getAllUsers(callback){
		UserModel.find({}, function(err, users){

			callback(err, users);
		});
	}

	getAllContactByUserRole(userRole, callback) {
		UserModel.find({'type' : userRole}, function(err, users) {
			callback(err, users);
		});
	}

	getMatchingUsers(keyword,callback){
		UserModel.find({'username':{'$regex': '.*'+keyword+'.*'}}, function(err, users){

			if (users.length == 0) callback(err,null);
			else callback(err, users);

		});

	}

	//search refactoring
	getMatchingContactByUserRole(keyword,userRole,callback){
		UserModel.find({'username':{'$regex': '.*'+keyword+'.*'}, 'type' : userRole}, function(err, users){

			if (users.length == 0) callback(err,null);
			else callback(err, users);

		});

	}

	getMatchingUsersWithStatus(keyword,callback){
		UserModel.find({'status':keyword}, function(err, users){

			if (users.length == 0) callback(err,null);
			else callback(err, users);

		});

	}

	updateUserOnlineStatus(username, status, callback){
		var state, updateQuery, curDate;
		if(status.toLowerCase()=="online"){
			state = 0;
		} if(status.toLowerCase()=="offline"){
			state = 1;
		}

		updateQuery = {onlineStatus: state};

		if(state == 0) {
			curDate = new Date();
			updateQuery["lastLoginAt"] = curDate;
		}
		else if(state == 1) {
			var dd1 = new Date();
			var n = dd1.toISOString();
			var nonlyDate = n.slice(0,10);
			var nonlyTime = n.slice(11,19);
			var newDate = nonlyDate +" "+ nonlyTime;
			updateQuery["lastLogoutAt"] = newDate;
		}


		UserModel.update({'username': username}, updateQuery
			, function(err, updated_user){

				callback(err, updated_user)

			});
	}


	updateStatusCode(username, statusCode, callback){
		UserModel.update({'username': username},{
			status: statusCode,
			lastStatusUpdate: new Date()
		}, function(err, updated_user){
			if (err) {
				if(callback != null) {
					callback(err, false);
				}
			} else {
				if(callback != null) {
					callback(err, updated_user);
				}
			}
		});
	}


	updateUserProfile(username,name,dob,sex,address,phone,email,conditions,allergies,drugs,
		emerName, emerPhone, emerEmail, callback){
  	UserModel.findOne({username: username}, function(err, doc){

        doc.name = name;
        doc.dob = dob;
        doc.sex = sex;
        doc.address = address;
        doc.phone = phone;
        doc.email = email;
        doc.conditions = conditions;
        doc.allergies = allergies;
        doc.drugs = drugs;
        doc.emerName = emerName;
        doc.emerPhone = emerPhone;
        doc.emerEmail = emerEmail;
        doc.save(function(err, record, numAffect){
        	callback(err, true);
        });

    });
  }

  //update user fields based on what data is sent
  updateUser(data, old_username, callback){
  	UserModel.findOne({username: old_username}, function(err, doc){

        //check if username needs to be changed
        if(data.username){
        	doc.username = data.username;
        }
        //check if password needs to be changed
        if(data.password){
        	doc.password = data.password;
        }
        //check if user privilege needs to be changed
        if(data.type){
        	doc.type = data.type;
        }
        //check if account status needs to be changed
        if(data.accountStatus==0 || data.accountStatus==1){
        	doc.accountStatus = data.accountStatus;
        }
        doc.save(function(err, record, numAffect){
        	callback(err, true);
        });

    });
  }

  addUser(data, callback){
  	var user = new UserModel();
  	user.username = data.username;
  	user.password = pw.createDBPassword(data.password);
  	user.status = data.status;
  	user.type = data.type;
    user.incidentList = data.incidentList;

  	user.save(function(err){

  		callback(err, user);

  	});
  }

  deleteUser(username, callback){
  	UserModel.find({'username': username}).remove(function(err){

  		callback(err);
  	});
  }

}

module.exports = userDb;
