process.env.NODE_ENV = 'test';

var expect = require('expect.js');
var Group = require("../models/group");

var newGroup1, newGroup2, newGroup3;

suite("Define Group Tests", function() {
    suiteSetup(function (done) {
        newGroup1 = new Group("Group1", "Jack", "New Group 1");
        newGroup2 = new Group("Group2", "Smith", "New Group 2");
        newGroup3 = new Group("Party", "Jack", "");
        done();
    });

    suiteTeardown(function (done) {
        Group.removeAllGroups()
            .then(() => done())
            .catch((err) => done(err));
    });

    test("can create group", function (done) {
        newGroup1.createGroup().then(savedGroup1 => {
            expect(savedGroup1.groupName).to.be("Group1");
            expect(savedGroup1.groupDescription).to.be("New Group 1");
            expect(savedGroup1.groupOwner).to.be("Jack");

            return newGroup2.createGroup();
        }).then(savedGroup2 => {
            expect(savedGroup2.groupName).to.be("Group2");
            expect(savedGroup2.groupDescription).to.be("New Group 2");
            expect(savedGroup2.groupOwner).to.be("Smith");

            return newGroup3.createGroup();
        }).then(savedGroup3 => {
            expect(savedGroup3.groupName).to.be("Party");
            expect(savedGroup3.groupDescription).to.be("");
            expect(savedGroup3.groupOwner).to.be("Jack");

            done();
        })
            .catch(err => done(err));
    });

    test("can get all groups", function (done) {
        Group.getAllGroups().then(groups => {
            expect(groups.length).to.be(3);
            done();
        })
            .catch(err => done(err));
    });

    test("can get my group in alphabetical order", function(done) {
       Group.getMyGroups("Jack").then(groups => {
           expect(groups.length).to.be(2);
           expect(groups[0].groupName).to.be("Group1");
           expect(groups[1].groupName).to.be("Party");
           done();
       })
           .catch(err => done(err));
    });

    test("can get group by group owner", function(done) {
       Group.getGroupByGroupOwner("Jack").then(groups => {
           expect(groups.length).to.be(2);
           expect(groups[0].groupName).to.be("Group1");
           expect(groups[1].groupName).to.be("Party");
           done();
       })
           .catch(err => done(err));
    });

    test("can get group by group name", function(done) {
        Group.getGroupByGroupName("Group1").then(groups => {
            expect(groups.length).to.be(1);
            expect(groups[0].groupName).to.be("Group1");
            expect(groups[0].groupOwner).to.be("Jack");
            done();
        })
            .catch(err => done(err));
    });

    test("can add member to group", function(done) {
        newGroup2.addGroupMember("Jack")
            .then((data) => {
                expect(data.groupMember).to.be("Jack");
                done();
            })
            .catch(err => done(err));
    });

    test("can get group members by group name in alphabetical order", function(done) {
        Group.getGroupMembersByGroupName("Group2").then(memberList => {
            expect(memberList.length).to.be(2);
            expect(memberList[0].groupMember).to.be("Jack");
            expect(memberList[1].groupMember).to.be("Smith");
            done();
        })
            .catch(err => done(err));
    });

    test("can update group and sync group member list", function(done) {
        newGroup2.groupName = "Group Two";
        newGroup2.updateGroup("Group2").then(n => {
            expect(n).to.be(1);
            return Group.getGroupMembersByGroupName("Group Two");
        }).then(memberList => {
            expect(memberList.length).to.be(2);
            expect(memberList[0].groupMember).to.be("Jack");
            expect(memberList[1].groupMember).to.be("Smith");
            done();
        })
            .catch(err => done(err));
    });

    test("can remove member from group", function(done) {
        newGroup2.removeGroupMember("Jack")
            .then(() => done())
            .catch(err => done(err));
    });

    test("can update group members, just add members", function(done) {
        newGroup3.updateGroupMembers(["Alpha", "Beta"], [])
            .then(() => {
                return Group.getGroupMembersByGroupName("Party");
            })
            .then(memberList => {
                expect(memberList.length).to.be(3);
                expect(memberList[0].groupMember).to.be("Alpha");
                expect(memberList[1].groupMember).to.be("Beta");
                expect(memberList[2].groupMember).to.be("Jack");
                done();
            })
            .catch(err => done(err));
    });

    test("can update group members, add and remove members", function(done) {
        newGroup3.updateGroupMembers(["Cello"], ["Alpha", "Beta"])
            .then(() => {
                return Group.getGroupMembersByGroupName("Party");
            })
            .then(memberList => {
                expect(memberList.length).to.be(2);
                expect(memberList[0].groupMember).to.be("Cello");
                expect(memberList[1].groupMember).to.be("Jack");
                done();
            })
            .catch(err => done(err));
    });

    test("can delete group", function (done) {
        newGroup3.deleteGroup()
            .then(() => done())
            .catch((err) => done(err));
    });

});
