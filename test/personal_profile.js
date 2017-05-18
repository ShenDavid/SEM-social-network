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

var newUser1 = createNewUser("User1", "Pass1",0,0);

suite("Add Personal Profile Info", function() {

	suiteSetup("Setup User", function(done){
        db.start(function(connection){
          conn = connection;
          userModel.addUser(newUser1, function(err, addedUser1) {
            expect(err).to.be(null);
            expect(addedUser1.username).to.be("User1");
            done();
          });
        });
	});

	suiteTeardown("Teardown User Profile", function(done){
        userModel.deleteUser(newUser1, function(err) {
          expect(err).to.be(null);
          db.close(conn, function(err) {
            done();
          });
        });
	});

	test("Add user details for user with no details", function(done) {
    var name = "Jason Borne";
    var number = 4128882222;
    var email = "newuser@andrew.cmu.edu";
    var address = "CMU, SV";
    var sex = "Male";
    var dob = "03/10/1990";
    var conditions = "nasty cough";
    var allergies = "nutz";
    var drugs = "crystal";
    var emerName = "Mommy";
    var emerPhone = 412911;
    var emerEmail = "mom@cmu.com";
		userModel.updateUserProfile(newUser1.username,name,dob,sex,address,number,email,conditions,
     allergies, drugs,emerName,emerPhone, emerEmail,function(err, success){
			expect(err).to.be(null);
			expect(success).to.be(true);
			userModel.getUserByName(newUser1.username, function(err, user){
				expect(err).to.be(null);
        expect(user.username).to.be(newUser1.username);
        expect(user.name).to.be(name);
        expect(user.phone).to.be(number);
        expect(user.email).to.be(email);
        expect(user.address).to.be(address);
        expect(user.sex).to.be(sex);
        expect(user.dob).to.be(dob);
        expect(user.conditions).to.be(conditions);
        expect(user.allergies).to.be(allergies);
        expect(user.drugs).to.be(drugs);
        expect(user.emerName).to.be(emerName);
        expect(user.emerPhone).to.be(emerPhone);
        expect(user.emerEmail).to.be(emerEmail);
        done();
    	});
    });
  });

test("Add user details for user who already has details", function(done) {
    var name = "Adam";
    var number = 4128882222;
    var email = "newEmail@andrew.cmu.edu";
    var address = "CMU, Pitt";
    var sex = "Male";
    var dob = "03/10/1010";
    var conditions = "nasty flu";
    var allergies = "fruit";
    var drugs = "ibuprofen";
    var emerName = "Daddy";
    var emerPhone = 9999;
    var emerEmail = "Daddy@cmu.com";
    userModel.updateUserProfile(newUser1.username,name,dob,sex,address,number,email,conditions,
     allergies, drugs,emerName,emerPhone, emerEmail,function(err, success){
      expect(err).to.be(null);
      expect(success).to.be(true);
      userModel.getUserByName(newUser1.username, function(err, user){
        expect(err).to.be(null);
        expect(user.username).to.be(newUser1.username);
        expect(user.name).to.be(name);
        expect(user.phone).to.be(number);
        expect(user.email).to.be(email);
        expect(user.address).to.be(address);
        expect(user.sex).to.be(sex);
        expect(user.dob).to.be(dob);
        expect(user.conditions).to.be(conditions);
        expect(user.allergies).to.be(allergies);
        expect(user.drugs).to.be(drugs);
        expect(user.emerName).to.be(emerName);
        expect(user.emerPhone).to.be(emerPhone);
        expect(user.emerEmail).to.be(emerEmail);
        done();
      });
    });
  });


});
