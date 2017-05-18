'use strict';

var userDb = require('../db/interface/userDb');

class Contact {
    constructor() {
    }

    isOnline(obj) {
        return (obj.onlineStatus == 0);
    }

    isOffline(obj) {
        return (obj.onlineStatus == 1);
    }

    getAllContacts(userRole, callback) {
        var userDbInstance = new userDb();

        var isOnline = this.isOnline;
        var isOffline = this.isOffline;

        if (userRole === 1) { // admin can see all users
            userDbInstance.getAllUsers(function (err, userList) {
                var onlineUsers = userList.filter(isOnline);
                var offlineUsers = userList.filter(isOffline);

                // sort by alphabetical order
                onlineUsers.sort(function (a, b) {
                    return a.username.localeCompare(b.username);
                });
                offlineUsers.sort(function (a, b) {
                    return a.username.localeCompare(b.username);
                });

                userList = onlineUsers.concat(offlineUsers)
                    .map(function(user) {
                        return user;
                    });
                callback(err, userList);
            });
        } else {
            var showedUser;
            if (userRole === 2) {
                showedUser = 0; //show citizen.
            } else {
                showedUser = userRole;
            }
            userDbInstance.getAllContactByUserRole(showedUser, function (err, userList) {
                var onlineUsers = userList.filter(isOnline);
                var offlineUsers = userList.filter(isOffline);

                // sort by alphabetical order
                onlineUsers.sort(function (a, b) {
                    return a.username.localeCompare(b.username);
                });
                offlineUsers.sort(function (a, b) {
                    return a.username.localeCompare(b.username);
                });
                userList = onlineUsers.concat(offlineUsers)
                    .map(function(user) {
                        return user;
                    });
                callback(err, userList);
            });
        }
    }

    //search refactoring
    getMatchingContactByUserRole(keyword, userRole, callback) {
        var userDbInstance = new userDb();

        var isOnline = this.isOnline;
        var isOffline = this.isOffline;

        if (userRole === 1) { // admin can see all users
            userDbInstance.getMatchingUsers(keyword, function (err, userList) {
                callback(err, userList);
            });
        } else {
            var showedUser;
            if (userRole === 2) {
                showedUser = 0; //show citizen.
            } else {
                showedUser = userRole;
            }
            userDbInstance.getMatchingContactByUserRole(keyword,showedUser, function (err, userList) {
                callback(err, userList);
            });
        }
    }

    sort(users) {
        users.sort(function (user1, user2) {
            return user1.username.localeCompare(user2.username);
        })
        return users;
    }

}

module.exports = Contact;
