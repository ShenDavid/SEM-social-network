process.env.NODE_ENV = 'test';

var expect = require('expect.js'),
		app = require("../app").app,
		server = require("../app").server,
		request = require("request"),
    Db = require("../db/db"),
    User = require("../models/user"),
		CryptoJS = require('crypto-js'),
    base_url = "http://localhost:8080/";


var userModel = new User();
var db = new Db();
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
var newUser3 = createNewUser("User3", "p3");

suite("Integration Tests - Join Community", function() {
	this.timeout(3000);

  suiteSetup(function(done) {
		//cookie jar to hold cookies
		db.start(function(connection){
			userModel.addUser(newUser1, function(err){
				expect(err).to.be(null);
				db.close(connection, function(err){
					done();
				})
			});
		});
  });

  suiteTeardown(function(done) {
		db.start(function(connection){
			userModel.deleteUser(newUser1, function(err){
				expect(err).to.be(null);
				userModel.deleteUser(newUser2, function(err){
					expect(err).to.be(null);
					db.close(connection, function(err) {
						done();
					});
				});
			});
		})
  });

	test("Login Existing User", function(done){
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

  test("Get Directory", function(done) {
    request.get({url: base_url + "users", jar: j}, function(err, response, body){
			expect(response.statusCode).to.be(200);
			expect(body.search(newUser1.username)).to.not.be(-1);
			expect(body.search("Online")).to.not.be(-1);
			done();
		});
  });

	test("Get Directory without permission", function(done) {
		request.get(base_url + "users", function(err, response, body){
			expect(response.statusCode).to.be(200);
			expect(body.search(newUser1.username)).to.be(-1);
			expect(body.search("Online")).to.be(-1);
			done();
		});
	});

	test("Post a new user to /users", function(done){
		request.get(base_url, function(error, response, body) {
			expect(response.statusCode).to.be(200);
			expect(body.search("Account Access")).to.not.be(-1);
			var reg = new RegExp(/verify\(\)\" rel=\"(.*)\">Login/g);
			var salt = body.match(reg)[0].split('"')[2];
			var pw = encrypt(newUser2.password, salt);
			var postData = {
				username : newUser2.username,
				ciphertext: pw.ciphertext,
				key : pw.key,
				iv : pw.iv,
				isCreate : true,
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
				expect(res.statusCode).to.be(201);
				done();
			});
		});
	});

	// test("Get User2 Profile", function(done){
	// 	request({url: base_url + "users/" + newUser2.username, jar: j}, function(error, res, body){
	// 		expect(res.statusCode).to.be(500);
	// 		expect(body.search("User2")).to.be(-1);
	// 		done();
	// 	});
	// });

	test("Password is too short", function(done){
		request.get(base_url, function(error, response, body) {
			expect(response.statusCode).to.be(200);
			expect(body.search("Account Access")).to.not.be(-1);
			var reg = new RegExp(/verify\(\)\" rel=\"(.*)\">Login/g);
			var salt = body.match(reg)[0].split('"')[2];
			var pw = encrypt(newUser3.password, salt);
			var postData = {
				username : newUser3.username,
				ciphertext: pw.ciphertext,
				key : pw.key,
				iv : pw.iv,
				isCreate : true,
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
				expect(res.statusCode).to.be(422);
				expect(body.errors).to.not.be(undefined);
				expect(body.errors.httpCode).to.be(422);
				expect(body.errors.usernameLenInvalid).to.be(false);
				expect(body.errors.passwordLenInvalid).to.be(true);
				expect(body.errors.usernameBanned).to.be(false);
				done();
			});
		});
	});

	test("Not logged in, can't access profile.", function(done){
		request({url: base_url + "users/" + newUser2.username}, function(error, res, body){
			expect(res.statusCode).to.be(200);
			expect(body.search("Welcome! User2")).to.be(-1);
			done();
		});
	});

	test("GET / but already with session", function(done){
		request({url: base_url, jar:j}, function(error, res, body){
			expect(res.statusCode).to.be(200);
			expect(body.search("Welcome! User2")).to.be(-1);
			done();
		});
	});

	test("Logout", function(done){
		request({url: base_url+"logout", jar:j}, function(error, res, body){
			expect(res.statusCode).to.be(200);
			expect(body.search("Account Access")).to.not.be(-1);
			expect(body.search("Login")).to.not.be(-1);
			done();
		});
	});

	test("Logout when not signed in", function(done){
		request({url: base_url+"logout"}, function(error, res, body){
			expect(res.statusCode).to.be(200);
			expect(body.search("Account Access")).to.not.be(-1);
			expect(body.search("Login")).to.not.be(-1);
			done();
		});
	});

});
