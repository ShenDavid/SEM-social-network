'use strict';

var config = require('../config.js');
var Db = require('../db/db');
var userDb = require('../db/interface/userDb');
var Status = require('./status');
var statusDb = require('../db/interface/statusDb');
var messageDb = require('../db/interface/messageDb');
var pw = require('../models/password');
var organizationDb = require('../db/interface/organizationDb'); //team kanban

class User {
  constructor() {
  }

  static isOnline(obj){
    return (obj.onlineStatus == 0);
  }

  static isOffline(obj){
    return (obj.onlineStatus == 1);
  }


  static getAllUsers(callback) {
    var userDbInst = new userDb();
    var isOnline = this.isOnline;
    var isOffline = this.isOffline;

    userDbInst.getAllUsers(function(err, user_list){

      var onlineUsers = user_list.filter(isOnline);
      var offlineUsers =user_list.filter(isOffline);

      // sort by alphabetical order
      onlineUsers.sort(function(a,b){
        return a.username.localeCompare(b.username);
      });

      offlineUsers.sort(function(a,b){
        return a.username.localeCompare(b.username);
      });

      user_list = onlineUsers.concat(offlineUsers);

      callback(err, user_list);
    });

  }

  static getMatchingUsers(keyword, callback) {
    var userDbInst = new userDb();
    var isOnline = this.isOnline;
    var isOffline = this.isOffline;

    userDbInst.getMatchingUsers(keyword,function(err, user_list){

      if(user_list != null) {
        var onlineUsers = user_list.filter(isOnline);
        var offlineUsers =user_list.filter(isOffline);

        // sort by alphabetical order
        onlineUsers.sort(function(a,b){
          return a.username.localeCompare(b.username);
        });

        offlineUsers.sort(function(a,b){
          return a.username.localeCompare(b.username);
        });

        user_list = onlineUsers.concat(offlineUsers);
      }

      callback(err, user_list);
    });

  }

  //search refactoring
  static getMatchingContactByUserRole(keyword, userRole,callback) {
    var userDbInst = new userDb();
    var isOnline = this.isOnline;
    var isOffline = this.isOffline;

    userDbInst.getMatchingContactByUserRole(keyword,userRole,function(err, user_list){

      if(user_list != null) {
        var onlineUsers = user_list.filter(isOnline);
        var offlineUsers =user_list.filter(isOffline);

        // sort by alphabetical order
        onlineUsers.sort(function(a,b){
          return a.username.localeCompare(b.username);
        });

        offlineUsers.sort(function(a,b){
          return a.username.localeCompare(b.username);
        });

        user_list = onlineUsers.concat(offlineUsers);
      }

      callback(err, user_list);
    });

  }

  static getMatchingUsersWithStatus(keyword, callback) {
    var userDbInst = new userDb();
    var isOnline = this.isOnline;
    var isOffline = this.isOffline;

    userDbInst.getMatchingUsersWithStatus(keyword,function(err, user_list){

      if(user_list != null) {
        var onlineUsers = user_list.filter(isOnline);
        var offlineUsers =user_list.filter(isOffline);

        // sort by alphabetical order
        onlineUsers.sort(function(a,b){
          return a.username.localeCompare(b.username);
        });

        offlineUsers.sort(function(a,b){
          return a.username.localeCompare(b.username);
        });

        user_list = onlineUsers.concat(offlineUsers);
      }

      callback(err, user_list);
    });

  }

  getUserByName(username, callback) {
    var userDbInst = new userDb();
    userDbInst.getUserByName(username, function(err, user){
      callback(err, user);
    });
  }

  //remove your active status and set username in session to null
  static logout(username, callback){
    var db = new Db();
    var userDbInst = new userDb();
    var name = username;

    userDbInst.updateUserOnlineStatus(name, "offline", function(err, updatedUser){
      if(!updatedUser || err){
        callback(err, false);
      } else {
        callback(err, true);
      }
    });
  }

  userInputInvalid(username, password, errList) {
    if(username.length < 3) {
      errList.httpCode = 422;
      errList.usernameLenInvalid = true;
    }
    if(config.bannedUserNames.indexOf(username.toLowerCase()) >= 0) {
      errList.httpCode = 422;
      errList.usernameBanned = true;
    }
    if(password.length < 4) {
      errList.httpCode = 422;
      errList.passwordLenInvalid = true;
    }

    return (errList.usernameLenInvalid || errList.usernameBanned || errList.passwordLenInvalid);
  }

  sendServerError(err, errList, callback) {
    errList.httpCode = 500; //Server Error
    callback(err, errList, null);
  }

  //validate if the username and pw is correct
  // if so check if it exists
  // otherwise create a new user
  validate(userInfo, isCreate, callback) {

    var username = userInfo.username;
    var password = userInfo.password;

    //errList -
    var errList = {
      httpCode: 200,
      usernameLenInvalid: false,
      passwordLenInvalid: false,
      usernameBanned: false
    };

    var that = this;

    if(this.userInputInvalid(username, password, errList)) {
      callback(-1, errList, null);
    } else {
      //Check if User exists
      var userDbInst = new userDb();
      userDbInst.getUserByName(username, function(err, matchedUser) {
        if(err) {
          that.sendServerError(err, errList, callback);
        } else if(typeof matchedUser != 'undefined' && matchedUser) {
          //user exists, check the password
          if(matchedUser.accountStatus==1){
            errList.httpCode = 405;
            callback(err, errList, null);
          }
          else if(pw.authenticate(password, matchedUser.password)){
            userDbInst.updateUserOnlineStatus(username, 'online', function(err, sucess){
              errList.httpCode = 200;
              callback(err, errList, matchedUser);
            });
          } else {
            errList.httpCode = 401;
            callback(err, errList, null);
          }
        } else if (isCreate == false || isCreate == "false"){
          errList.httpCode = 404;
          callback(err, errList, null);
        } else {
          errList.httpCode = 201;
          callback(err, errList, null);
        }
      });
    }
  }

  addUser(userInfo, callback) {
   var userDbInst = new userDb();
   var errList = {httpCode: 200,
    usernameLenInvalid: false,
    passwordLenInvalid: false,
    usernameBanned: false
  };

  var that = this;

  userDbInst.addUser(userInfo, function(err, newUser){
   if(err) {
    that.sendServerError(err, errList, callback);
  }
  else {
    errList.httpCode = 201;
    userDbInst.getAllUsers(function(err, user_list){
      callback(err, newUser, user_list);
    });
  }
});
}


updateUserProfile(username,name,dob,sex,address,phone,email,conditions,allergies,drugs, emerName,
 emerPhone, emerEmail,callback){
  var userDbInst = new userDb();
  userDbInst.updateUserProfile(username,name,dob,sex,address,phone,email,conditions,allergies,drugs,
    emerName, emerPhone, emerEmail, function(err, success){
    if(err) {
      console.log("In models, error in updating user profile");
      console.log(err);
    }
    else callback(err, success);
  });
}

updateStatus(userInfo, callback) {
 var userDbInst = new userDb();
 var statusDbInst = new statusDb();

 var username = userInfo.username;
 var newStatus = userInfo.status;
 var status = new Status(username, newStatus);

 userDbInst.updateStatusCode(username, newStatus, function(err) {
  if(err) {
   callback(err);
 }
 else {
   status.saveStatus(function(err) {
    if(err) {
     callback(err);
   }
   else {
     callback(null);
   }
 });
 }
});
 this.status = newStatus;
}

updateUser(userInfo, old_username, callback){
  var userDbInst = new userDb();
  userDbInst.updateUser(userInfo, old_username, function(err, success){
    callback(err, success);
  })
}

deleteUser(userInfo, callback) {
  var userDbInst = new userDb();
  var statusDbInst = new statusDb();
  var messageDbInst = new messageDb();
  var username = userInfo.username;

  userDbInst.deleteUser(username, function(err) {
   if(err) {
    callback(true);
  }
  else {
    statusDbInst.deleteStatusCrumbsByUser(username, function(err) {
     if(err) {
      callback(err);
    }
    else {
      messageDbInst.deleteAllMessagesByUser(username, function(err) {
       callback(err);
     });
    }
  });
  }
});
}


    //team kanban

    static getAllResponders(callback) {
        var organizationDbInst = new organizationDb();

        organizationDbInst.getAllResponders(function(err, responders) {
            callback(err, responders);
        });
    }

    static getAllChiefs(callback) {
        var organizationDbInst = new organizationDb();

        organizationDbInst.getAllChiefs(function(err, chiefs) {
            callback(err, chiefs);
        });
    }

}



module.exports = User;
