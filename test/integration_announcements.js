process.env.NODE_ENV = 'test';

var expect = require('expect.js'),
		app = require("../app").app,
		server = require("../app").server,
		request = require("request"),
    Db = require("../db/db"),
    User = require("../models/user"),
		Announcement = require("../models/announcement")
		CryptoJS = require('crypto-js'),
    base_url = "http://localhost:8080/";


var userModel = new User();
var db = new Db();
var j = request.jar();
var j1 = request.jar();
var j2 = request.jar();

function encrypt(password, salt){
	var key = CryptoJS.PBKDF2(password, CryptoJS.enc.Hex.parse(salt), { keySize: 256/32, iterations: 1000 }).toString();
	var iv = CryptoJS.lib.WordArray.random(256/8).toString();
	var ciphertext = CryptoJS.AES.encrypt(password, key, {iv: iv}).toString();

	return {key: key, iv: iv, ciphertext: ciphertext};
}

function createNewUser(name, pw, ty) {
 	var newUser = {
		username: name,
		password: pw,
		status: 0,
		type: ty,
  };
  return newUser;
}

var postTime = new Date();
var newUser1 = createNewUser("TestUser1", "Pass1", 1);
var newUser2 = createNewUser("TestUser2", "Pass2", 0);
var newUser3 = createNewUser("TestUser3", "Pass3", 0);

suite("Integration Test for Announcements", function() {
	this.timeout(3000);

	suiteSetup("Add user and setup", function(done) {
		//cookie jar to hold cookies
		db.start(function(connection){
			userModel.addUser(newUser1, function(err){
				expect(err).to.be(null);
				userModel.addUser(newUser2, function(err){
					expect(err).to.be(null);
					User.logout(newUser2.username, function(err, success){
						expect(err).to.be(null);
						expect(success).to.be(true);
						userModel.addUser(newUser3, function(err){
							expect(err).to.be(null);
							db.close(connection, function(err){
								done();
							});
						});
					});
				})
			});
		});
  });

	suiteTeardown("Remove user and teardown", function(done) {
		db.start(function(connection){
			userModel.deleteUser(newUser1, function(err){
				expect(err).to.be(null);
				userModel.deleteUser(newUser2, function(err){
					expect(err).to.be(null);
					userModel.deleteUser(newUser3, function(err) {
						expect(err).to.be(null);
						var newAnnouncement1 = new Announcement("Test Announcement 1", "TestUser1", postTime, "37", "-100", "Mountain View");
						newAnnouncement1.deleteAnnouncement(function(err) {
							expect(err).to.be(null);
							db.close(connection, function(err) {
								done();
							});
						});
					})
				});
			});
		})
  });

	test("Login", function(done){
		request.get(base_url, function(error, response, body) {
			expect(response.statusCode).to.be(200);
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

	test("Save Announcements", function(done) {
		request.get({url: base_url + "users", jar: j}, function(err, response, body){
			expect(response.statusCode).to.be(200);
			var postData = {
				annData : "Test Announcement 1",
	      author : "TestUser1",
	      postedAt : new Date(),
	      latitude : "37",
	      longitude : "-100",
	      city : "Mountain View"
			};
			var options = {
				method: 'post',
				body: postData,
				json: true,
				url: base_url + "messages/announcements",
				jar: j
			};

			request(options, function(err, res, body){
				expect(err).to.be(null);
				expect(res.statusCode).to.be(201);
				done();
			});
		});
	});

	test("Pin Announcement", function(done){
		var postData = {
			annData : "Test Announcement 1",
			author : "TestUser1"
		};

		var options = {
			method: 'post',
			body: postData,
			json: true,
			url: base_url + "messages/pinAnnouncement",
			jar: j
		};

		request(options, function(err, res, body){
			expect(err).to.be(null);
			expect(res.statusCode).to.be(201);
			done();
		});
	});

	test("UnPin Announcement", function(done){
		var postData = {
			annData : "Test Announcement 1",
			author : "TestUser1"
		};

		var options = {
			method: 'post',
			body: postData,
			json: true,
			url: base_url + "messages/unpinAnnouncement",
			jar: j
		};

		request(options, function(err, res, body){
			expect(err).to.be(null);
			expect(res.statusCode).to.be(201);
			done();
		});
	});

	test("Retrieve Announcements", function(done) {
		request.get({url: base_url + "messages/announcements", jar: j}, function(err, response, body){
			expect(response.statusCode).to.be(200);
			expect(body.search("Test Announcement 1")).to.not.be(-1);
			expect(body.search("TestUser1")).to.not.be(-1);
			done();
		});
	});

	test("Retrieve Announcements without permission", function(done) {
		request.get({url: base_url + "messages/announcements"}, function(err, response, body){
			expect(response.statusCode).to.be(200);
			expect(body.search("Account Access")).to.not.be(-1);
			expect(body.search("Login")).to.not.be(-1);
			done();
		});
	});

	// Doesn't Work
	test("Retrieve Announcements after being logged out", function(done){
		request.get(base_url, function(error, response, body) {
			expect(response.statusCode).to.be(200);
			var reg = new RegExp(/verify\(\)\" rel=\"(.*)\">Login/g);
			var salt = body.match(reg)[0].split('"')[2];
			var pw = encrypt(newUser2.password, salt);
			var postData = {
				username : newUser2.username,
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
				jar: j2
			};
			request(options, function(err, res, body){
				expect(err).to.be(null);
				expect(res.statusCode).to.be(200);
				request.get({url: base_url + "messages/announcements", jar: j2}, function(err, response, body){
					expect(response.statusCode).to.be(200);
					expect(body.search("Test Announcement 1")).to.not.be(-1);
					expect(body.search("User2")).to.not.be(-1);
					done();
				});
			});
		});
	});

	test("Post Announcement without permission", function(done){
		request.post(base_url + "messages/announcements", function(err, response, body){
			expect(response.statusCode).to.be(302);
			expect(body.search("Redirecting to /")).to.not.be(-1);
			done();
		});
	});

	test("Non admin User3", function(done){
	//	User.logout(newUser1.username, function(err, success){
		//	expect(err).to.be(null);
		//	expect(success).to.be(true);
			request.get(base_url, function(error, response, body) {
				expect(response.statusCode).to.be(200);
				var reg = new RegExp(/verify\(\)\" rel=\"(.*)\">Login/g);
				var salt = body.match(reg)[0].split('"')[2];
				var pw = encrypt(newUser3.password, salt);
				var postData = {
					username : newUser3.username,
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
					jar: j1
				};
				request(options, function(err, res, body){
					expect(err).to.be(null);
					expect(res.statusCode).to.be(200);
					// Try to post an announcement
					request.get({url: base_url + "users", jar: j1}, function(err, response, body){
						expect(response.statusCode).to.be(200);
						var postData = {
							annData : "Test Announcement 3",
			      	author : "TestUser3",
			      	postedAt : new Date(),
			      	latitude : "37",
			      	longitude : "-100",
			      	city : "Mountain View"
						};
						var options = {
							method: 'post',
							body: postData,
							json: true,
							url: base_url + "messages/announcements",
							jar: j1
						};

						request(options, function(err, res, body){
							expect(err).to.be(null);
							expect(res.statusCode).to.be(403);
							done();
						});
					});
				});
			});
//		});
	});

});
