"use strict";
var Promise = require('bluebird');

var mongoose = require('../db/connect');
var group = require('../db/schema/group.js');
var groupMemberList = require('../db/schema/groupMemberList.js');

var groupModel = mongoose.model('Group', group.groupInfoSchema);
var groupMemberListModel = mongoose.model('GroupMemberList', groupMemberList.groupMemberListSchema);

class Group {
    constructor(groupName, groupOwner, groupDescription) {
        this.groupName = groupName;
        this.groupOwner = groupOwner;
        this.groupDescription = groupDescription;
    }
    
    static getSystemDefinedGroups() {
        return ['Public','Info','Responders','Dispatch','Police','Fire','Medic','Nurses'];
    }

    // class functions
    static getAllGroups() {
        return groupModel.find();
    }

    static getMyGroups(userName) {
        return groupMemberListModel.find({'groupMember': userName})
            .sort({'groupName': 1});
    }

    //search refactoring
    static getMatchingGroups(keyword, username) {
        var group_list1;
        var group_list2;
        return new Promise(function (resolve, reject) {
            groupMemberListModel.find({'groupMember': username, 'groupName': {'$regex': '.*' + keyword + '.*'}})
                .sort({'groupName': 1}).then(data => {
                group_list1 = data;
                return groupModel.find({'groupOwner': username, 'groupName': {'$regex': '.*' + keyword + '.*'}})
                    .sort({'groupName': 1});
            }).then(data => {
                group_list2 = data;
                resolve([group_list1, group_list2]);
            })
                .catch(err => reject(err));
        });
    }

    static getGroupByGroupOwner(groupOwner) {
        return groupModel.find({'groupOwner': groupOwner})
            .sort({'groupName': 1});
    }

    static getGroupByGroupName(groupName) {
        return groupModel.find({"groupName": groupName});
    }

    static getGroupMembersByGroupName(groupName) {
        return groupMemberListModel.find({'groupName': groupName})
            .sort({'groupMember': 1});
    }

    static removeAllGroups() {
        return new Promise(function (resolve, reject) {
            groupModel.remove({}).then(() => {
                groupMemberListModel.remove({})
                    .then(() => resolve())
                    .catch(err => reject(err));
            }).catch(err => reject(err));
        });
    }

    static updateGroupMemberAlert(groupMember, groupName) {
        return groupMemberListModel.update(
            {groupName: groupName, groupMember:groupMember},
            {$set: {ifAlert:true}},
            {multi: true});
    }

    // member functions
    createGroup() {
        var group = new groupModel();
        group.groupName = this.groupName;
        group.groupOwner = this.groupOwner;
        group.groupDescription = this.groupDescription;

        var groupMemberList = new groupMemberListModel();
        groupMemberList.groupName = this.groupName;
        groupMemberList.groupMember = this.groupOwner;
        groupMemberList.ifAlert = true;

        //add group
        return new Promise(function (resolve, reject) {
            Group.getGroupByGroupName(group.groupName).then(groupData => {
                if (groupData.length !== 0) {
                    reject("Group name has been used. Plese use another groupName");
                    return;
                }
                return groupMemberList.save();
            }).then(() => {
                return group.save();
            }).then(createdGroup => resolve(createdGroup))
                .catch(err => reject(err));
        });
    }

    deleteGroup() {
        var groupName = this.groupName;
        return new Promise(function (resolve, reject) {
            groupModel.remove({'groupName': groupName}).then(() => {
                return groupMemberListModel.remove({'groupName': groupName});
            }).then(() => resolve())
                .catch(err => reject(err))
        });
    }

    updateGroup(originalGroupName) {
        var group = this;
        return new Promise(function (resolve, reject) {
            groupModel.update({groupName: originalGroupName}, group).then(count => {
                groupMemberListModel.update(
                    {groupName: originalGroupName},
                    {$set: {groupName: group.groupName}},
                    {multi: true})
                    .then(() => resolve(count.nModified))
                    .catch(err => reject(err));
            }).catch(err => reject(err));
        });
    }

    addGroupMember(groupMember) {
        var groupMemberList = new groupMemberListModel();
        groupMemberList.groupName = this.groupName;
        groupMemberList.groupMember = groupMember;
        return groupMemberList.save();
    }

    removeGroupMember(groupMember) {
        return groupMemberListModel.remove({
            'groupName': this.groupName,
            'groupMember': groupMember
        });
    }

    updateGroupMembers(newMembers, deleteMembers) {
        var group = this;
        return new Promise(function(resolve, reject) {
            Promise.each(newMembers, function(newMember) {
                return group.addGroupMember(newMember);
            }).then(() => {
                if (deleteMembers === undefined || deleteMembers.length === 0) {
                    return Promise.resolve();
                } else {
                    return groupMemberListModel.remove({
                        'groupName': group.groupName,
                        'groupMember': {$in: deleteMembers}
                    });
                }
            }).then(() => {
                resolve();
            }).catch(err => reject(err));
        });
    }
}
module.exports = Group;

