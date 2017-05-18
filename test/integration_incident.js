process.env.NODE_ENV = 'test';

var expect = require('expect.js');
var request = require("request-promise");
var Promise = require('bluebird');

var app = require("../app").app;
var createNewUser = require("./integration_login").createNewUser;
var login = require("./integration_login").login;
var logout = require("./integration_login").logout;
var Incident = require("../models/incident");
var Group = require("../models/group");
var Patient = require("../models/patient");
var base_url = "http://localhost:8080";

var j1 = request.jar();
var j2 = request.jar();
var incident_ids = [];

suite("Integration Test for Incident", function() {
    this.timeout(3000);

    suiteSetup(function (done) {
        createNewUser("Jack", "Pass1", 0, 3).then(() => {
            return login("Jack", "Pass1", j1, false);
        }).then(() => {
            return createNewUser("Mike", "Pass1", 0, 4)
        }).then(() => {
            return login("Mike", "Pass1", j2, false);
        })
        .then(() => done())
        .catch(err => done(err));
    });

    suiteTeardown(function (done) {
        Incident.removeAllIncidents()
            .then(() => {
                return Group.removeAllGroups();
            }).then(() => {
                return Patient.deleteAllPatients();
            }).then(() => {
                return logout("Jack");
            }).then(() => {
                return logout("Mike");
            })
            .then(() => done())
            .catch((err) => done(err));
    });

    test("Test Post Incident RESTful API", function(done){
        var forms = [
        { opening_datetime: 'Mon May 01 2017 00:37:04 GMT-0700 (PDT)',
            id: 'I_Jack_5/1/2017_80p',
            creator: 'Jack',
            commander: 'Jack',
            address: 'Mountain View, CA 94043, USA',
            type: 'Fire',
            smoke: 'Yes',
            smokecolor: 'Black',
            smokequantity: 'Heavy',
            flame: 'Yes',
            injury: 'Yes',
            structype: 'Building',
            hmaterial: 'Yes',
            insidePeople: '0',
            getout: 'Yes',
            priority: 'E'
        },
        { opening_datetime: 'Mon May 01 2017 00:38:53 GMT-0700 (PDT)',
            id: 'I_Jack_5/1/2017_vkf',
            creator: 'Jack',
            commander: 'Jack',
            address: 'Mountain View, CA 94043, USA',
            type: 'Medical',
            patients:
                [ { name: 'Mike',
                    dateOfBirth: '05/12/2017',
                    age: '20',
                    sex: 'Yes',
                    conscious: 'Yes',
                    normalBreathing: 'Yes',
                    complaint: 'No',
                    condition: '0',
                    drugs: 'No',
                    allergies: 'No' } ],
            priority: 'E' },
            { opening_datetime: 'Mon May 01 2017 00:38:53 GMT-0700 (PDT)',
                id: 'I_Jack_5/1/2017_vkf',
                creator: 'Jack',
                commander: 'Jack',
                address: 'Mountain View, CA 94043, USA',
                type: 'Medical',
                patients:
                    [ { name: 'Mike',
                        dateOfBirth: '05/12/2017',
                        age: '20',
                        sex: 'Yes',
                        conscious: 'Yes',
                        normalBreathing: 'Yes',
                        complaint: 'No',
                        condition: '0',
                        drugs: 'No',
                        allergies: 'No' },
                    { name: 'Jane',
                        dateOfBirth: '05/12/2017',
                        age: '20',
                        sex: 'No',
                        conscious: 'Yes',
                        normalBreathing: 'Yes',
                        complaint: 'No',
                        condition: '0',
                        drugs: 'No',
                        allergies: 'No' }],
                priority: 'E' },
        { opening_datetime: 'Mon May 01 2017 00:40:29 GMT-0700 (PDT)',
            id: 'I_Jack_5/1/2017_8wy',
            creator: 'Jack',
            commander: 'Jack',
            address: 'Mountain View, CA 94043, USA',
            type: 'Police',
            weapon: 'Yes',
            injured: 'Yes',
            suspect: 'Unavailable',
            vehicle: 'Black car',
            means: 'Rob',
            travel: 'North',
            left: 'Yes',
            safe: 'Yes',
            detail: 'Unavailable',
            priority: 'E' }
        ];

        Promise.each(forms, function(form) {
            return new Promise((resolve, reject) => {
                var options = {
                    uri: base_url + "/incidents",
                    method: 'POST',
                    jar: j1,
                    resolveWithFullResponse: true,
                    simple: false,
                    json: true,
                    form: form
                };

                request(options)
                    .then(res => {
                        expect(res.statusCode).to.be(200);
                        incident_ids.push(res.body._id);
                        resolve();
                    })
                    .catch(err => reject(err));
            });
        })
            .then(() => done())
            .catch((err) => done(err));
    });

    test("Update incident", function(done) {
        var options = {
            uri: base_url + "/incidents",
            method: 'POST',
            jar: j1,
            resolveWithFullResponse: true,
            simple: false,
            json: true,
            form: {_id: incident_ids[0], priority: '1'}
        };

        request(options)
            .then(res => {
                expect(res.statusCode).to.be(200);
                done();
            })
            .catch(err => done(err));
    });

    test("Change status", function(done) {
        var newStates = ["Waiting", "Triage", "Assigned", "Closed"];
        Promise.each(newStates, function(newState, i) {
            return new Promise((resolve, reject) => {
                var options = {
                    uri: base_url + "/incident/changeStatus/"+incident_ids[i],
                    method: 'POST',
                    jar: j1,
                    resolveWithFullResponse: true,
                    simple: false,
                    json: true,
                    form: {newState: newState}
                };

                request(options)
                    .then(res => {
                        expect(res.statusCode).to.be(200);
                        resolve();
                    })
                    .catch(err => reject(err));
            });
        })
            .then(() => done())
            .catch((err) => done(err));
    });

    test("ESN-12 Access Incidents Directory as dispatcher", function(done) {
        var options = {
            uri: base_url + "/incidents",
            method: 'GET',
            jar: j1,
            resolveWithFullResponse: true
        };

        request(options)
            .then(res => {
                expect(res.statusCode).to.be(200);
                done();
            })
            .catch(err => done(err));
    });

    test("ESN-12 Access Incidents Directory as chief/responder", function(done) {
        var options = {
            uri: base_url + "/incidents",
            method: 'GET',
            jar: j2,
            resolveWithFullResponse: true
        };

        request(options)
            .then(res => {
                expect(res.statusCode).to.be(200);
                done();
            })
            .catch(err => done(err));
    });

    test("Test Access New Incident Page", function(done){
        var options = {
            uri: base_url + "/incident",
            method: 'GET',
            jar: j1,
            resolveWithFullResponse: true
        };

        request(options)
            .then(res => {
                expect(res.statusCode).to.be(200);
                done();
            })
            .catch(err => done(err));

    });

    test("Test Access Update Incident Page", function(done){
        var options = {
            uri: base_url + "/incident/"+incident_ids[1],
            method: 'GET',
            jar: j1,
            resolveWithFullResponse: true
        };

        request(options)
            .then(res => {
                expect(res.statusCode).to.be(200);
                done();
            })
            .catch(err => done(err));

    });

    test("Transfer command", function(done) {
        var options = {
            uri: base_url + "/incident/transferCommand/"+incident_ids[0],
            method: 'POST',
            jar: j1,
            resolveWithFullResponse: true,
            simple: false,
            json: true,
            form: {commander: "ZZS"}
        };

        request(options)
            .then(res => {
                expect(res.statusCode).to.be(200);
                done();
            })
            .catch(err => done(err));
    });

    test("User need to login to perform actions for incident", function(done) {
        urls = [{
            url: "/incidents",
            method: "POST"
        }, {
            url: "/incident/changeStatus/1",
            method: "POST"
        }, {
            url: "/incident/transferCommand/1",
            method: "POST"
        }];
        request({
            uri: base_url + "/incidents",
            method: "GET",
            resolveWithFullResponse: true,
            simple: false
        }).then(res => {
            expect(res.statusCode).to.be(200);
            expect(res.req.path).to.be("/");
            return request({
                uri: base_url + "/incident",
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
});