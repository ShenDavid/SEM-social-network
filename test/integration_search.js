process.env.NODE_ENV = 'test';

var expect = require('expect.js'),
	app = require("../app").app,
  express = require("express"),
	server = require("../app").server,
  Db = require("../db/db"),
	request = require("request"),
  CryptoJS = require('crypto-js'),
  User = require('../models/user'),
  Announcement = require("../models/announcement"),
	Message = require("../models/message"),
  base_url = "http://localhost:8080/";

//var app = express();
var db = new Db();
var userModel = new User();
//var server = supertest.agent(base_url);
var j = request.jar();

function encrypt(password, salt){
    var key = CryptoJS.PBKDF2(password, CryptoJS.enc.Hex.parse(salt), { keySize: 256/32, iterations: 1000 }).toString();
    var iv = CryptoJS.lib.WordArray.random(256/8).toString();
    var ciphertext = CryptoJS.AES.encrypt(password, key, {iv: iv}).toString();

    return {key: key, iv: iv, ciphertext: ciphertext};
}

function createNewUser(name, pw) {
  var newUser = {
		username: name,
        password: pw,
        status: 0,
        type: 0
  };
  return newUser;
}

var newUser1 = createNewUser("User1", "Pass1");
var newUser2 = createNewUser("User2", "Pass2");
var postTime = new Date();
var newAnnouncement1;
var newMessage1;
var newMessage2;

suite("Integration Tests - Search", function() {

	this.timeout(3000);

  suiteSetup(function(done) {
			newMessage1 = new Message("Test Message 1", "TestUser1", "PM", postTime, "Wall", "37", "-100", "Mountain View", 1);
			newMessage2 = new Message("Test Message 2", "TestUser1", "TestUser2", postTime, "Wall", "37", "-100", "Mountain View", 1);
		db.start(function(connection){
			userModel.addUser(newUser1, function(err){
				expect(err).to.be(null);
				newAnnouncement1 = new Announcement("TestAnnouncement1", "TestUser1", postTime, "37", "-100", "Mountain View");
				newAnnouncement1.saveAnnouncement(function(err, annData){
					expect(err).to.be(null);
					newMessage2.saveMessage(function(status, message){
						expect(status).to.be(201);
						expect(message).to.not.be(undefined);
						newMessage1.saveMessage(function(status, message){
							expect(status).to.be(201);
							expect(message).to.not.be(undefined);
							db.close(connection, function(err){
								request.get(base_url, function(error, response, body) {
									expect(response.statusCode).to.be(200);
									expect(body.search("Account Access")).to.not.be(-1);
									var reg = new RegExp(/verify\(\)\" rel=\"(.*)\">Login/g);
									var salt = body.match(reg)[0].split('"')[2];
									var pw = encrypt(newUser1.password, salt);
									var postData = {
										username : newUser1.username,
										ciphertext: pw.ciphertext,
										key : pw.key,
										iv : pw.iv,
										isCreate : false,
									};
									var options = {
										method: 'post',
										body: postData,
										json: true,
										url: base_url + "users",
										jar: j
									};
									request(options, function(err, res, body){
										expect(err).to.be(null);
										expect(res.statusCode).to.be(200);
										done();
									});
								});
							});
						});
					});
				});
			});
		});
  });

  suiteTeardown(function(done) {
		db.start(function(connection){
			userModel.deleteUser(newUser1, function(err){
				expect(err).to.be(null);
				userModel.deleteUser(newUser2, function(err){
					expect(err).to.be(null);
	      	newAnnouncement1.deleteAnnouncement(function(err) {
						expect(err).to.be(null);
						newMessage1.deleteMessage(function(err){
							expect(err).to.be(null);
							newMessage2.deleteMessage(function(err){
								db.close(connection, function(err) {
								 server.close();
								 done();
								});
							});
						})
        	});
				});
			});
		})
  });

  test("Existing User Search", function(done) {
     request({url: base_url + "search?keyword=" + newUser1.username, jar: j}, function(err, res, body) {
        expect(err).to.be(null);
        expect(res.statusCode).to.be(200);
        expect(body.search(newUser1.username)).to.not.be(-1);
        expect(body.search("No Matching Results")).to.be(-1);
				expect(body.search("Undefined")).to.not.be(-1);
        done();
     });
  });

  test("Non-existing User Search", function(done) {
     request({url: base_url + "search?keyword=abcdg", jar: j}, function(err, res, body) {
        expect(err).to.be(null);
        expect(res.statusCode).to.be(200);
        expect(body.search("No Matching Results")).to.not.be(-1);
        done();
     });
  });

  test("Existing Announcement", function(done) {
     request({url: base_url + "search?keyword=TestAnnouncement", jar: j}, function(err, res, body) {
        expect(err).to.be(null);
        expect(res.statusCode).to.be(200);
				expect(body.search("Matching Announcements")).to.not.be(-1);
        expect(body.search("TestAnnouncement")).to.not.be(-1);
        done();
     });
  });

	test("Status Undefined", function(done) {
		 request({url: base_url + "search?keyword=Undefined", jar: j}, function(err, res, body) {
				expect(err).to.be(null);
				expect(res.statusCode).to.be(200);
				expect(body.search("Matching Status")).to.not.be(-1);
				expect(body.search("Undefined")).to.not.be(-1);
				done();
		 });
	});

	test("Status Ok", function(done) {
		 request({url: base_url + "search?keyword=OK", jar: j}, function(err, res, body) {
				expect(err).to.be(null);
				expect(res.statusCode).to.be(200);
				expect(body.search("No Matching Results")).to.not.be(-1);
				expect(body.search("Undefined")).to.be(-1);
				done();
		 });
	});

	test("Status Help", function(done) {
		 request({url: base_url + "search?keyword=HelP", jar: j}, function(err, res, body) {
				expect(err).to.be(null);
				expect(res.statusCode).to.be(200);
				expect(body.search("No Matching Results")).to.not.be(-1);
				expect(body.search("Undefined")).to.be(-1);
				done();
		 });
	});

	test("Status Emergency", function(done) {
		 request({url: base_url + "search?keyword=Emergency", jar: j}, function(err, res, body) {
				expect(err).to.be(null);
				expect(res.statusCode).to.be(200);
				expect(body.search("No Matching Results")).to.not.be(-1);
				expect(body.search("Undefined")).to.be(-1);
				done();
		 });
	});

	test("More Public Chat Searches", function(done){
		request({url: base_url + "search?keyword=test message&more=public&lastTime=2016-10-04%2020:26", jar: j}, function(err, res, body) {
			 expect(err).to.be(null);
			 expect(res.statusCode).to.be(201);
			 expect(body).to.be.empty();
			 done();
		});
	});

	test("More Private Chat Searches", function(done){
		request({url: base_url + "search?keyword=test message&more=private&lastTime=2016-10-04%2020:26", jar: j}, function(err, res, body) {
			 expect(err).to.be(null);
			 expect(res.statusCode).to.be(201);
			 expect(body).to.be.empty();
			 done();
		});
	});

	test("More Announcement Searches", function(done){
		request({url: base_url + "search?keyword=test message&more=ann&lastTime=2016-10-04%2020:26", jar: j}, function(err, res, body) {
			 expect(err).to.be(null);
			 expect(res.statusCode).to.be(201);
			 expect(body).to.be.empty();
			 done();
		});
	});
	
	test("Redirect without session", function(done){
		request.get(base_url + "search", function(err, response, body){
			expect(response.statusCode).to.be(200);
			expect(body.search("Account Access")).to.not.be(-1);
			expect(body.search("Login")).to.not.be(-1);
			done();
		});
	});

})
