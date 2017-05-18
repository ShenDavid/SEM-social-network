process.env.NODE_ENV = 'test';

var expect = require('expect.js'),
		server = require("../app"),
		request = require("request"),
    Db = require("../db/db"),
    User = require("../models/user"),
    user_route = require("../routes/users"),
    pw = require("../models/password"),
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

function createNewUser(name, pw, status, type) {
	var newUser = {
		username: name,
		password: pw,
		status: status,
		type: type
  };
  return newUser;
}

var newUser1 = createNewUser("User1", "Pass1", 0, 0);
var admin = createNewUser("ESNAdmin", "admin", 1, 1);

suite("Integration Tests - Admin User Profile", function() {
	this.timeout(3000);

  suiteSetup(function(done) {
		//cookie jar to hold cookies
		db.start(function(connection){
			userModel.addUser(newUser1, function(err){
				expect(err).to.be(null);
				//userModel.addUser(admin, function(err){
					//expect(err).to.be(null);
					db.close(connection, function(err){
						done();
					});
				//});
			});
		});
  });

  suiteTeardown(function(done) {
		db.start(function(connection){
			userModel.deleteUser(newUser1, function(err){
				expect(err).to.be(null);
				userModel.deleteUser(admin, function(err){
					expect(err).to.be(null);
					db.close(connection, function(err) {
						done();
					});
				});
			});
		});
  });

  test("Check if Admin Exists, it doesn't so Add Admin", function(done){
    user_route.checkAdmin(function(success, msg){
      expect(success).to.be(true);
      expect(msg).to.be("admin user added");
      done();
    });
  });

  test("Check if Admin Exists, it does", function(done){
    user_route.checkAdmin(function(success, msg){
      expect(success).to.be(true);
      expect(msg).to.be("admin user already exists");
      done();
    });
  });

	test("Login User1", function(done){
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

	test("Attempt to change profile name as Citizen", function(done){
			var postData = {
				username : newUser1.username,
				newUsername: "JohnSmith"
			};
			var options = {
				method: 'post',
				body: postData,
				json: true,
				url: base_url + "users/User1",
				jar: j
			};
		request(options, function(error, res, body){
			expect(res.statusCode).to.be(403);
			done();
		});
	});

	test("Logout User1", function(done){
		request({url: base_url+"logout", jar:j}, function(error, res, body){
			expect(res.statusCode).to.be(200);
			expect(body.search("Account Access")).to.not.be(-1);
			expect(body.search("Login")).to.not.be(-1);
			done();
		});
	});

	test("Login Admin", function(done){
		request.get(base_url, function(error, response, body) {
			expect(response.statusCode).to.be(200);
			var reg = new RegExp(/verify\(\)\" rel=\"(.*)\">Login/g);
			var salt = body.match(reg)[0].split('"')[2];
			var pw = encrypt(admin.password, salt);
			var postData = {
				username : admin.username,
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

	test("Change User1's Username as Admin", function(done){
		var postData = {
			username : newUser1.username,
			newUsername: "JohnSmith"
		};
		var options = {
			method: 'post',
			body: postData,
			json: true,
			url: base_url + "users/User1",
			jar: j
		};
		request(options, function(error, res, body){
			expect(res.statusCode).to.be(200);
			expect(body.errors.httpCode).to.be(200);
			expect(body.errors.usernameLenInvalid).to.be(false);
			expect(body.errors.passwordLenInvalid).to.be(false);
			expect(body.errors.usernameBanned).to.be(false);
			db.start(function(connection){
				userModel.getUserByName(postData.newUsername, function(err, user){
					db.close(connection, function(ret){
						newUser1.username = "JohnSmith";
						expect(err).to.be(null);
						expect(user.username).to.be(postData.newUsername);
						done();
					});
				});
			});
		});
	});

  test("Try to Change User1's (now JohnSmith) Username into Something Invalid", function(done){
    var postData = {
      username :  newUser1.username,
      newUsername: "aa"
    };
    var options = {
      method: 'post',
      body: postData,
      json: true,
      url: base_url + "users/User1",
      jar: j
    };
    request(options, function(error, res, body){
      expect(res.statusCode).to.be(422);
      expect(body.errors.httpCode).to.be(422);
      expect(body.errors.usernameLenInvalid).to.be(true);
      expect(body.errors.passwordLenInvalid).to.be(false);
      expect(body.errors.usernameBanned).to.be(false);
      db.start(function(connection){
        userModel.getUserByName(postData.username, function(err, user){
          db.close(connection, function(ret){
            expect(err).to.be(null);
            expect(user.username).to.be(postData.username);
            done();
          });
        });
      });
    });
  });

	test("Change User1 (now JohnSmith) to be a Coordinator", function(done){
		var postData = {
			username : "JohnSmith",
			newPrivilege : 2
		};
		var options = {
			method: 'post',
			body: postData,
			json: true,
			url: base_url + "users/JohnSmith",
			jar: j
		};
		request(options, function(error, res, body){
			expect(res.statusCode).to.be(200);
			expect(body.errors.httpCode).to.be(200);
			expect(body.errors.usernameLenInvalid).to.be(false);
			expect(body.errors.passwordLenInvalid).to.be(false);
			expect(body.errors.usernameBanned).to.be(false);
			db.start(function(connection){
				userModel.getUserByName(postData.username, function(err, user){
					db.close(connection, function(ret){
						expect(err).to.be(null);
						expect(user.username).to.be("JohnSmith");
						expect(user.type).to.be(postData.newPrivilege);
						done();
					});
				});
			});
		});
	});

  test("Deactivate User1 (now JohnSmith)", function(done){
		var postData = {
			username : "JohnSmith",
			wantDeactivate : 1
		};
		var options = {
			method: 'post',
			body: postData,
			json: true,
			url: base_url + "users/JohnSmith",
			jar: j
		};
		request(options, function(error, res, body){
			expect(res.statusCode).to.be(200);
			expect(body.errors.httpCode).to.be(200);
			expect(body.errors.usernameLenInvalid).to.be(false);
			expect(body.errors.passwordLenInvalid).to.be(false);
			expect(body.errors.usernameBanned).to.be(false);
			db.start(function(connection){
				userModel.getUserByName(postData.username, function(err, user){
					db.close(connection, function(ret){
						expect(err).to.be(null);
						expect(user.username).to.be("JohnSmith");
						expect(user.accountStatus).to.be(1);
						done();
					});
				});
			});
		});
	});

  test("Reactivate User1 (now JohnSmith)", function(done){
		var postData = {
			username : "JohnSmith",
			wantActivate : 1
		};
		var options = {
			method: 'post',
			body: postData,
			json: true,
			url: base_url + "users/JohnSmith",
			jar: j
		};
		request(options, function(error, res, body){
			expect(res.statusCode).to.be(200);
			expect(body.errors.httpCode).to.be(200);
			expect(body.errors.usernameLenInvalid).to.be(false);
			expect(body.errors.passwordLenInvalid).to.be(false);
			expect(body.errors.usernameBanned).to.be(false);
			db.start(function(connection){
				userModel.getUserByName(postData.username, function(err, user){
					db.close(connection, function(ret){
						expect(err).to.be(null);
						expect(user.username).to.be("JohnSmith");
						expect(user.accountStatus).to.be(0);
						done();
					});
				});
			});
		});
	});

});
