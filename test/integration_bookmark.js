process.env.NODE_ENV = 'test';

var expect = require('expect.js');
var request = require("request");
var bluebird = require('bluebird');

var app = require("../app").app;
var login = require("./integration_login").login;
var logout = require("./integration_login").logout;

var	Bookmark = require("../models/bookmark");
var	base_url = "http://localhost:8080/";

var j = request.jar();

var bookmark1 = {
    "username": "ESNAdmin",
    "longitude" : -122.05967679999999,
    "latitude" : 37.4104081,
    "postedAt" : "2017-04-30 02:16:05",
    "author" : "ESNAdmin",
    "messageData" : "Hello",
    "city" : "Mountain View",
    "currStatus" : "OK",
    "receiver" : "Public",
    "messageType" : "Wall"
};

suite("Integration Tests - Bookmark", function() {
	this.timeout(3000);
    
    suiteSetup(function(done) {
        login("Ivor", "Shuang", j)
            .then(() => done())
            .catch(err => done(err));
    });

    suiteTeardown(function(done) {
        logout("Ivor")
        	.then(() => done())
            .catch(err => done(err));
    });

	test("Add Bookmark", function(done){
		var options = {
			method: 'post',
			body: bookmark1,
			json: true,
			url: base_url + "messages/bookmark",
			jar: j
		};

		request(options, function(err, res, body){
			expect(err).to.be(null);
			expect(res.statusCode).to.be(201);
			done();
		});
	});

	test("Delete Bookmark", function(done){
		var options = {
			method: 'post',
			body: bookmark1,
			json: true,
			url: base_url + "messages/unbookmark",
			jar: j
		};

		request(options, function(err, res, body){
			expect(err).to.be(null);
			expect(res.statusCode).to.be(201);
			done();
		});
	});
});
