process.env.NODE_ENV = 'test';

var expect = require('expect.js'),
	Db = require("../db/db"),
	User = require("../models/user"),
  pw = require("../models/password");

var userModel = new User();
var db = new Db();
//use conn to hold the connection
var conn;

function createNewUser(name, pw, type, accountStatus) {
	var newUser = {
		username: name,
		password: pw,
		status: 0,
		type: type,
    accountStatus: accountStatus
	};
	return newUser;
}

var newUser1 = createNewUser("User1", "Pass1", 0, 0);

suite("Admin User Profile", function() {

	suiteSetup("Setup Admin User Profile", function(done){
        db.start(function(connection){
          conn = connection;
          userModel.addUser(newUser1, function(err, addedUser1) {
            expect(err).to.be(null);
            expect(addedUser1.username).to.be("User1");
            done();
          });
        });
	});

	suiteTeardown("Teardown Admin User Profile", function(done){
        userModel.deleteUser(newUser1, function(err) {
          expect(err).to.be(null);
          db.close(conn, function(err) {
            done();
          });
        });
	});

	test("Update User Name", function(done) {
    var data = {username: "JohnSmith"};
		userModel.updateUser(data, newUser1.username, function(err, success){
			expect(err).to.be(null);
			expect(success).to.be(true);
			userModel.getUserByName(data.username, function(err, user){
				expect(err).to.be(null);
        expect(user.username).to.be(data.username);
        //change name back
        userModel.updateUser({username: newUser1.username}, data.username, function(err, success){
          expect(err).to.be(null);
          expect(success).to.be(true);
          done();
        });
    	});
    });
  });

  test("Update User Password", function(done) {
    var new_pw = pw.createDBPassword("newPassword");
    var data = {password: new_pw};

    userModel.updateUser(data, newUser1.username, function(err, success){
      expect(err).to.be(null);
      expect(success).to.be(true);
      userModel.getUserByName(newUser1.username, function(err, user){
        expect(err).to.be(null);
        expect(user.password).to.be(data.password);
        expect(pw.authenticate("newPassword", user.password)).to.be(true);
        done();
      });
    });
  });

  test("Update User Type", function(done) {
    var data = {type: 1};
    userModel.updateUser(data, newUser1.username, function(err, success){
      expect(err).to.be(null);
      expect(success).to.be(true);
      userModel.getUserByName(newUser1.username, function(err, user){
        expect(err).to.be(null);
        expect(user.type).to.be(data.type);
        done();
        
      });
    });
  });

  test("Update User AccountStatus", function(done) {
    var data = {accountStatus: 1};
    userModel.updateUser(data, newUser1.username, function(err, success){
      expect(err).to.be(null);
      expect(success).to.be(true);
      userModel.getUserByName(newUser1.username, function(err, user){
        expect(err).to.be(null);
        expect(user.accountStatus).to.be(data.accountStatus);
        done();
      });
    });
  });


});
