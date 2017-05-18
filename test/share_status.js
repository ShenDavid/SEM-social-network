process.env.NODE_ENV = 'test';

var expect = require('expect.js'),
	Db = require("../db/db"),
	User = require("../models/user"),
	Status = require("../models/status"),
	base_url = "http://localhost:8080/";

var userModel = new User();
var statusModel = new Status();
var db = new Db();
//use conn to hold the connection
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

suite("Share Status", function() {

	suiteSetup("Setup Status", function(done){
		db.start(function(connection){
			conn = connection;
			done();
		});
	});

	suiteTeardown("Teardown Status", function(done){
		db.close(conn, function(ret){
			done();
		});
	});

	test("Initial Status", function(done) {
		var newUser = createNewUser("abcd", "12345");
		userModel.addUser(newUser, function(err, addedUser){
			expect(err).to.be(null);
			expect(addedUser.status).to.be(0);
			userModel.deleteUser(newUser, function(err){
				expect(err).to.be(null);
				done();
			});
		});
	});

	test("Change Status", function(done) {
		var newUser = createNewUser("abcd", "12345");
		var newStatus = 2;

		userModel.addUser(newUser, function(err, addedUser) {
			expect(err).to.be(null);
			expect(addedUser.status).to.be(0);
			newUser.status = newStatus;
			userModel.updateStatus(newUser, function(err) {
				expect(err).to.be(null);
				userModel.getUserByName(newUser.username, function(err, fetchedUser) {
					expect(err).to.be(null);
					expect(fetchedUser).to.not.be(undefined);
					expect(fetchedUser.status).to.be(newUser.status);
					Status.getStatusCrumbs(newUser.username, function(err, httpCode, statusCrumbs) {
						expect(err).to.be(null);
						expect(statusCrumbs).to.not.be(undefined);
						expect(httpCode).to.be(200);
						expect(statusCrumbs.length).to.be(1);
						expect(statusCrumbs[0].statusCode).to.be(newUser.status);
						userModel.deleteUser(newUser, function(err) {
							expect(err).to.be(null);
							done();
						});
					});
				});
			});
		});
	});

	test("Status History", function(done) {
		var newUser = createNewUser("abcd", "12345");

		userModel.addUser(newUser, function(err, addedUser) {
			expect(err).to.be(null);
			expect(addedUser.status).to.be(0);
			newUser.status = 2;
			userModel.updateStatus(newUser, function(err){
				expect(err).to.be(null);
				newUser.status= 1;
				userModel.updateStatus(newUser, function(err){
					expect(err).to.be(null);
					newUser.status = 0;
					userModel.updateStatus(newUser, function(err){
						expect(err).to.be(null);
						userModel.getUserByName(newUser.username, function(err, fetchedUser){
							expect(err).to.be(null);
							expect(fetchedUser).to.not.be(undefined);
							expect(fetchedUser.status).to.be(0);
							Status.getStatusCrumbs(newUser.username, function(err, httpCode, statusCrumbs) {
								expect(err).to.be(null);
								expect(statusCrumbs).to.not.be(undefined);
								expect(httpCode).to.be(200);
								expect(statusCrumbs.length).to.be(3);
								expect(statusCrumbs[0].statusCode).to.be(0);
								expect(statusCrumbs[1].statusCode).to.be(1);
								expect(statusCrumbs[2].statusCode).to.be(2);
								userModel.deleteUser(newUser, function(err){
									expect(err).to.be(null);
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
