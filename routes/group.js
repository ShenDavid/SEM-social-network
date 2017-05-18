"use strict";

var Promise = require("bluebird");
var Group = require('../models/group');
var User = require('../models/user');

/***** PAGES *****/
exports.getGroups = function(req, res, next) {
    //see if user is logged in
    if (!req.session.username){
        res.redirect(302, '/');
        return;
    }
    var user = req.session.user;
    var userName = user.username;
    var manage_group_list = {};
    var belong_to_group_list = {};

    Group.getGroupByGroupOwner(userName).then(data => {
        manage_group_list = data;
        return Group.getMyGroups(userName);
    }).then(data => {
        belong_to_group_list = data;
        res.render('groups', {
            user: user,
            username: userName,
            manage_group_list: manage_group_list,
            belong_to_group_list: belong_to_group_list,
            nav_title: "Groups",
            requiresBottomNav: true
        });
    })
    .catch(err => res.status(500).send(err));
};

exports.newOrShowGroup = function(req, res, next) {
    if (!req.session.username){
        res.redirect(302, '/');
        return;
    }

    var user = req.session.user;
    var userName = user.username;
    var groupName = req.params.groupName;
    
    var action;
    if (groupName === undefined || groupName == "")
    {
        action = "new";
    } else {
        action = "update";
    }

    var groupData = {};
    var memberData = [];
    var memberNotInGroup = [];
    var allGroups = [];
    // get groups
    Group.getGroupByGroupOwner(userName).then(data => {
        allGroups = allGroups.concat(data);
        console.log("allGroups: " + JSON.stringify(allGroups));

        if (user.type >= 10 || user.type === 4 || user.type === 6) {
            var systemGroupNames = Group.getSystemDefinedGroups();
            for (var i in systemGroupNames) {
                var systemGroupName = systemGroupNames[i];
                allGroups.push({
                    groupName: systemGroupName
                });
            }
        }

        // get group data
        if (action === "new") {
            return Promise.resolve([new Group("", userName, "")]);
        } else {
            return Group.getGroupByGroupName(groupName);
        }
    }).then(data => {
        groupData = data;

        // get group members
        if (action === "new") {
            return Promise.resolve([{groupMember: userName}]);
        } else {
            return Group.getGroupMembersByGroupName(groupName);
        }
    }).then(data => {
        memberData = data;

        // get members not in groups
        return new Promise((resolve, reject) => {
            User.getAllUsers(function (err, user_list) {
                if (err) reject(err);

                var memberInGroup = new Array();
                for (var i in memberData) {
                    memberInGroup.push(memberData[i].groupMember);
                }

                var memberNotInGroup = new Array();
                for (var i in user_list) {
                    if (memberInGroup.indexOf(user_list[i].username) < 0) {
                        memberNotInGroup.push(user_list[i]);
                    }
                }
                resolve(memberNotInGroup);
            });
        });
    }).then(data => {
        memberNotInGroup = data;

        res.render('group', {
            user: user,
            username: userName,
            group: groupData[0],
            members: memberData,
            allUsers: memberNotInGroup,
            allGroups: allGroups,
            action: action,
            nav_title: "Group",
            requiresBottomNav: true
        });
    }).catch(err => res.status(500).send(err));
};

/***** APIs *****/
exports.createNewGroup = function(req,res, next){
    if (!req.session.username) {
        res.status(401).send("Plese login to perform this action");
        return;
    }

    var groupName = req.body.groupName;
    var groupOwner = req.session.user.username;
    var groupDescription = req.body.groupDescription;

    if (req.body.groupName != null && req.body.groupName != "") {
        groupName = req.body.groupName;
    } else {
        res.status(400).send("Plese specify group name");
        return;
    }

    var group = new Group(groupName, groupOwner, groupDescription);
    group.createGroup().then(group => {
        res.send(group);
    }).catch(err => {
        res.status(500).send(err);
    });
};


exports.updateGroup = function(req, res, next) {
    if (!req.session.username){
        res.status(401).send("Plese login to perform this action");
        return;
    }

    var io = req.app.get('io');
    var groupName = req.body.groupName;
    var groupOwner = req.session.user.username;
    var groupDescription = req.body.groupDescription;
    var originalGroupName = req.body.originalGroupName;

    if (req.body.groupName != null && req.body.groupName != "") {
        groupName = req.body.groupName;
    } else {
        res.status(400).send("Plese specify group name");
        return;
    }

    var group = new Group(groupName, groupOwner, groupDescription);
    group.updateGroup(originalGroupName).then((count) => {
        if(io){
            io.emit('new_member_added_to_group', groupName, groupOwner);
        }
        res.send(group);
    })
    .catch((err) => {
        res.status(500).send(err);
    });
};

exports.getGroupMembers = function(req, res, next) {
    if (!req.session.username) {
        res.status(401).send("Plese login to perform this action");
        return;
    }

    var groupName = req.params.groupName;
    Group.getGroupMembersByGroupName(groupName).then((members) => {
        res.send(members);
    }).catch(err => res.status(500).send(err));
};

exports.updateGroupMembers = function(req, res, next) {
    if (!req.session.username) {
        res.status(401).send("Plese login to perform this action");
        return;
    }

    var groupName = req.params.groupName;
    var newMembers = JSON.parse(req.body.newMembers);
    var deleteMembers = JSON.parse(req.body.deleteMembers);
    var group = new Group(groupName);
    group.updateGroupMembers(newMembers, deleteMembers).then(() => {
        var io = req.app.get('io');
        if (io) {
            for (var i in newMembers) {
                io.emit('new_member_added_to_group', groupName, newMembers[i]);
            }
        }
        res.send(groupName);
    }).catch(err => res.status(500).send(err));
};

exports.addGroupMember = function(req, res, next){
    if (!req.session.username) {
        res.status(401).send("Plese login to perform this action");
        return;
    }

    var io = req.app.get('io');

    var groupName = req.params.groupName;
    var groupMember = req.params.groupMember;
    var group = new Group(groupName);
    group.addGroupMember(groupMember).then(() => {
        if(io){
            io.emit('new_member_added_to_group', req.params.groupName, req.params.groupMember);
        }
        res.send(req.params);
    }).catch(err => res.status(500).send(err));
};

exports.deleteGroupMember = function(req, res, next){
    if (!req.session.username) {
        res.status(401).send("Plese login to perform this action");
        return;
    }
    var groupName = req.params.groupName;
    var groupMember = req.params.groupMember;
    var group = new Group(groupName);
    group.removeGroupMember(groupMember).then(() => {
        res.send(req.params);
    }).catch(err => res.status(500).send(err));
};



exports.deleteGroup = function(req, res, next){
    if (!req.session.username) {
        res.status(401).send("Plese login to perform this action");
        return;
    }
    
    var group = new Group(req.params.groupName);
    group.deleteGroup()
        .then(() => res.send(req.params.groupName))
        .catch((err) => res.status(500).send(err));
};

exports.checkGroupAlert = function (req, res, next) {
    if (!req.session.username) {
        res.status(401).send("Plese login to perform this action");
        return;
    }

    var io = req.app.get('io');
    var userName = req.session.user.username;

    Group.getMyGroups(userName).then(groups =>{
        for (var i in groups){
            var group = groups[i];
            if (io && group.ifAlert === false){
                io.emit('new_member_added_to_group', group.groupName, userName);
            }
        }
        res.send({
            username: userName,
            groups: groups
        });
    }).catch(err => res.status(500).send(err));
};

exports.updateAlert = function (req, res, next) {
    if (!req.session.username) {
        res.status(401).send("Plese login to perform this action");
        return;
    }

    var groupName = req.body.groupName;
    var groupMember = req.body.groupMember;

    Group.updateGroupMemberAlert(groupMember, groupName).then(groupData => {
        res.send(groupData);
    }).catch(err => {
        res.status(500).send(err);
    });
};

exports.addSystemDefinedGroups = function(callback){
    Promise.each(Group.getSystemDefinedGroups(), function(groupName) {
        var sysGroup = new Group(
            groupName,
            'ESNAdmin',
            'Group includes all ' + groupName + ' personnel.'
        );
        return sysGroup.createGroup();
    }).then(() => callback(true))
        .catch(() => callback(false));
};

exports.checkSystemDefinedGroups = function(callback){
    Group.getGroupByGroupName('Police').then(group => {
        if (group.length == 0) {
            this.addSystemDefinedGroups(function(success){
                if(success){
                    callback(true, "system group added");
                } else {
                    callback(false, "system group does not exist, failed to add system group");
                }
            });
        } else {
            callback(true, 'group police already exists');
        }
    }).catch(() => {callback(false, 'db error when getting system group');});
};

exports.getUserInGroups = function(req, res, next) {
    if (!req.session.username){
        res.redirect(302, '/');
        return;
    }

    var userName = req.session.username;
    var manage_group_list = {};
    var belong_to_group_list = {};
    Group.getGroupByGroupOwner(userName).then(data => {
        manage_group_list = data;
        return Group.getMyGroups(userName);
    }).then(data => {
        belong_to_group_list = data;
        res.status(200).send(belong_to_group_list);
    })
    .catch(err => res.status(500).send(err));
};

