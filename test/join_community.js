process.env.NODE_ENV = 'test';

var expect = require('expect.js'),
	request = require("request"),
  Db = require("../db/db"),
  User = require("../models/user"),
	password = require("../models/password");
  base_url = "http://localhost:8080/";

var userModel = new User();
var db = new Db();
var newUser1, newUser2, newUser3, newUser4, newUser5;
var conn;

function createNewUser(name, pw) {
  var newUser = {
		username: name,
    password: pw,
    status: 0,
    type: 0
  };
  return newUser;
}

suite("User Tests", function() {
	suiteSetup(function(done) {
		newUser1 = createNewUser("User1", "Pass1");
		newUser2 = createNewUser("U2", "Pass2");
		newUser3 = createNewUser("User3", "Pa3");
		newUser4 = createNewUser("admin", "Pass4");
		newUser5 = createNewUser("User1", "Pass5");
		newUser6 = createNewUser("User6", "Pass6");
		newUser7 = createNewUser("User7", "Pass7");
		newUser8 = createNewUser("User8", "Pass8");
		db.start(function(connection){
			conn = connection;
			userModel.addUser(newUser1, function(err, addedUser1) {
				expect(err).to.be(null);
	      expect(addedUser1.username).to.be("User1");
				userModel.addUser(newUser7, function(err, addedUser7){
					expect(err).to.be(null);
					expect(addedUser7.username).to.be("User7");
					userModel.addUser(newUser8, function(err, addedUser8){
						expect(err).to.be(null);
						expect(addedUser8.username).to.be("User8");
						User.logout(addedUser8.username, function(err, success){
							expect(err).to.be(null);
							expect(success).to.be(true);
							done();
						});
					});
				});
	    });
		});
  });

	suiteTeardown(function(done) {
		userModel.deleteUser(newUser1, function(err) {
			expect(err).to.be(null);
			userModel.deleteUser(newUser7, function(err){
				expect(err).to.be(null);
				userModel.deleteUser(newUser8, function(err){
					expect(err).to.be(null);
					db.close(conn, function(err) {
						done();
					});
				});
			});
		});
	});

	test("Username length", function(done) {
			userModel.validate(newUser2, true, function(err, errList, matchedUser) {
				expect(errList.httpCode).to.be(422);
        expect(errList.usernameLenInvalid).to.be(true);
					done();
			});
	});

	test("Password length", function(done) {
			userModel.validate(newUser3, true, function(err, errList, matchedUser) {
				expect(errList.httpCode).to.be(422);
				expect(errList.passwordLenInvalid).to.be(true);
					done();
			});
	});

	test("Banned username", function(done) {
			userModel.validate(newUser4, true, function(err, errList, matchedUser) {
				expect(errList.httpCode).to.be(422);
					done();
			});
	});

	test("Username password mismatch", function(done) {
			userModel.validate(newUser5, false, function(err, errList, matchedUser) {
				expect(errList.httpCode).to.be(401);
					done();
      });
  });

	test("Get All Users", function(done){
		User.getAllUsers(function(err, user_list){
			expect(err).to.be.undefined;
			expect(user_list.length).to.be(3);
			expect(user_list[0].username).to.be("User1");
			done();
		});
	});

	test("Send Server Error", function(done){
		var err_list = {
			httpCode: 200,
			usernameLenInvalid: false,
			passwordLenInvalid: false,
			usernameBanned: false
		};
		userModel.sendServerError(null, err_list, function(err, errList, matchedUser){
			expect(err).to.be(null);
			expect(errList.httpCode).to.be(500);
			expect(matchedUser).to.be(null);
			done();
		});
	});

	test("Login properly", function(done){
		userModel.validate(newUser1, false, function(err, errList, matchedUser){
			expect(err).to.be(null);
			expect(errList.httpCode).to.be(200);
			expect(errList.usernameLenInvalid).to.be(false);
			expect(errList.passwordLenInvalid).to.be(false);
			expect(errList.usernameBanned).to.be(false);
			expect(matchedUser.username).to.be(newUser1.username);
			done();
		});
	});

	test("Login a user who doesn't exist", function(done){
		userModel.validate(newUser6, false, function(err, errList, matchedUser){
			expect(err).to.be(null);
			expect(errList.httpCode).to.be(404);
			expect(errList.usernameLenInvalid).to.be(false);
			expect(errList.passwordLenInvalid).to.be(false);
			expect(errList.usernameBanned).to.be(false);
			expect(matchedUser).to.be(null);
			done();
		});
	});

	test("Create New User", function(done){
		userModel.validate(newUser6, true, function(err, errList, matchedUser){
			expect(err).to.be(null);
			expect(errList.httpCode).to.be(201);
			expect(errList.usernameLenInvalid).to.be(false);
			expect(errList.passwordLenInvalid).to.be(false);
			expect(errList.usernameBanned).to.be(false);
			expect(matchedUser).to.be(null);
			done();
		});
	});

	test("Branch checking for password code", function(done){
		expect(password.authenticate("pass", null)).to.be(false);
		expect(password.authenticate("pass", "pass")).to.be(false);
		done();
	});

});
