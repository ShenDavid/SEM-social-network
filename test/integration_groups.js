process.env.NODE_ENV = 'test';

var expect = require('expect.js');
var request = require("request-promise");
var Promise = require('bluebird');

var app = require("../app").app;
var createNewUser = require("./integration_login").createNewUser;
var login = require("./integration_login").login;
var logout = require("./integration_login").logout;
var Group = require("../models/group");
var group_routes = require("../routes/group");
var base_url = "http://localhost:8080";

var j = request.jar();

suite("Integration Test for Groups", function() {
    this.timeout(3000);
    suiteSetup(function(done) {
        createNewUser("Neng", "Pass1", 0, 4).then(() => {
            return login("Neng", "Pass1", j, false);
        })
            .then(() => done())
            .catch(err => done(err));
    });

    suiteTeardown(function(done) {
        Group.removeAllGroups()
            .then(() => { return logout("Neng"); })
            .then(() => done())
            .catch((err) => done(err));
    });

    test("Epic ESN-1: Access group page", function(done) {
        var options = {
            uri: base_url + "/group",
            method: 'GET',
            jar: j,
            resolveWithFullResponse: true
        };

        request(options)
            .then(res => {
                expect(res.statusCode).to.be(200);
                done();
            })
            .catch(err => done(err));
    });

    test("Epic ESN-3: Groups directory page", function(done) {
        var options = {
            uri: base_url + "/groups",
            method: 'GET',
            jar: j,
            resolveWithFullResponse: true
        };

        request(options)
            .then(res => {
                expect(res.statusCode).to.be(200);
                done();
            })
            .catch(err => done(err));
    });

    test("ESN-47 Define new group", function(done) {
        var form = {
            "groupName": "Group 1",
            "groupDescription": "New Group 1"
        };

        var options = {
            uri: base_url + "/groups",
            method: "POST",
            jar: j,
            resolveWithFullResponse: true,
            simple: false,
            json: true,
            form: form
        };

        request(options)
            .then(res => {
                expect(res.statusCode).to.be(200);
                var group = res.body;
                expect(group.groupName).to.be("Group 1");
                expect(group.groupDescription).to.be("New Group 1");
                done();
            })
            .catch((err) => done(err));
    });

    test("Epic ESN-3: Groups directory page (update)", function(done) {
        var options = {
            uri: base_url + "/group/Group 1",
            method: 'GET',
            jar: j,
            resolveWithFullResponse: true
        };

        request(options)
            .then(res => {
                expect(res.statusCode).to.be(200);
                done();
            })
            .catch(err => done(err));
    });

    test("ESN-54 Update My Group Information", function(done) {
        var form = {
            "groupName": "Group 1",
            "groupDescription": "New description",
            "originalGroupName": "Group 1"
        };

        var options = {
            uri: base_url + "/group",
            method: "PUT",
            jar: j,
            resolveWithFullResponse: true,
            simple: false,
            json: true,
            form: form
        };

        request(options)
            .then(res => {
                expect(res.statusCode).to.be(200);
                var group = res.body;
                expect(group.groupName).to.be("Group 1");
                expect(group.groupDescription).to.be("New description");
                done();
            })
            .catch((err) => done(err));
    });

    test("Update Group Members", function(done) {
        var form = {
            "newMembers": JSON.stringify(["Lin", "Dan"]),
            "deleteMembers": "[]"
        };

        var options = {
            uri: base_url + "/groups/Group 1/members",
            method: "POST",
            jar: j,
            resolveWithFullResponse: true,
            simple: false,
            form: form
        };

        request(options)
            .then(res => {
                expect(res.statusCode).to.be(200);
                expect(res.body).to.be("Group 1");
                done();
            })
            .catch((err) => done(err));
    });

    test("Get Group Members", function(done) {
        var options = {
            uri: base_url + "/groups/Group 1/members",
            method: "GET",
            jar: j,
            resolveWithFullResponse: true,
            simple: false,
            json: true
        };

        request(options)
            .then(res => {
                expect(res.statusCode).to.be(200);
                var groupMembers = res.body;
                expect(groupMembers[0].groupMember).to.be("Dan");
                expect(groupMembers[1].groupMember).to.be("Lin");
                expect(groupMembers[2].groupMember).to.be("Neng");
                done();
            })
            .catch((err) => done(err));
    });

    test("Add group member", function(done) {
        var options = {
            uri: base_url + "/groups/Group 1/members/Shicheng",
            method: "POST",
            jar: j,
            resolveWithFullResponse: true,
            simple: false
        };

        request(options)
            .then(res => {
                expect(res.statusCode).to.be(200);
                done();
            })
            .catch((err) => done(err));
    });

    test("Delete group member", function(done) {
        var options = {
            uri: base_url + "/groups/Group 1/members/Shicheng",
            method: "DELETE",
            jar: j,
            resolveWithFullResponse: true,
            simple: false
        };

        request(options)
            .then(res => {
                expect(res.statusCode).to.be(200);
                done();
            })
            .catch((err) => done(err));
    });

    test("Check Group Alert", function(done) {
        var options = {
            uri: base_url + "/groups/alert",
            method: "GET",
            jar: j,
            resolveWithFullResponse: true,
            simple: false,
            json: true
        };

        request(options)
            .then(res => {
                expect(res.statusCode).to.be(200);
                expect(res.body.username).to.be("Neng");
                expect(res.body.groups[0].groupName).to.be("Group 1");
                done();
            })
            .catch((err) => done(err));
    });

    test("Update Group Alert", function(done) {
        var form = {
            "groupName": "Group 1",
            "groupMember": "Lin"
        };

        var options = {
            uri: base_url + "/groups/alert",
            method: "POST",
            jar: j,
            resolveWithFullResponse: true,
            simple: false,
            json: true,
            form: form
        };

        request(options)
            .then(res => {
                expect(res.statusCode).to.be(200);
                done();
            })
            .catch((err) => done(err));
    });

    test("Delete group member", function(done) {
        var options = {
            uri: base_url + "/groups/Group 1",
            method: "DELETE",
            jar: j,
            resolveWithFullResponse: true,
            simple: false
        };

        request(options)
            .then(res => {
                expect(res.statusCode).to.be(200);
                done();
            })
            .catch((err) => done(err));
    });

    test("User need to login to perform actions for group", function(done) {
        urls = [{
            url: "/groups/alert",
            method: "GET"
        }, {
            url: "/groups/Group 1/members",
            method: "GET"
        }, {
            url: "/groups/Group 1/members",
            method: "POST"
        }, {
            url: "/groups/alert",
            method: "POST"
        }, {
            url: "/group",
            method: "PUT"
        }, {
            url: "/groups",
            method: "POST"
        }, {
            url: "/groups/Group 1/members/haha",
            method: "POST"
        }, {
            url: "/groups/Group 1",
            method: "DELETE"
        }, {
            url: "/groups/Group 1/members/haha",
            method: "DELETE"
        }];
        request({
            uri: base_url + "/groups",
            method: "GET",
            resolveWithFullResponse: true,
            simple: false
        }).then(res => {
            expect(res.statusCode).to.be(200);
            expect(res.req.path).to.be("/");
            return request({
                uri: base_url + "/group",
                method: "GET",
                resolveWithFullResponse: true,
                simple: false
            });
        }).then(res => {
            expect(res.statusCode).to.be(200);
            expect(res.req.path).to.be("/");

            return Promise.each(urls, function(url) {
                return new Promise((resolve, reject) => {
                    request({
                        uri: base_url + url.url,
                        method: url.method,
                        resolveWithFullResponse: true,
                        simple: false
                    }).then((res) => {
                        expect(res.statusCode).to.be(401);
                        resolve();
                    }).catch((err) => reject(err));
                });
            });
        })
            .then(() => done())
            .catch((err) => done(err));
    });

    test("Check system defined groups", function(done) {
        group_routes.checkSystemDefinedGroups(function(err, message) {
            if (err)
                done();
            else
                done(message);
        });
    });
});