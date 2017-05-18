process.env.NODE_ENV = 'test';

var expect = require('expect.js'),
	  request = require("request"),
    Db = require("../db/db"),
		User = require("../models/user"),
    Message = require("../models/message");
    base_url = "http://localhost:8080/";

    var userModel = new User();
    var postTime = new Date();
    var newMessage1, newMessage2, newMessage3;
    var newUser1, newUser2;
    var db = new Db();
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

suite("Chat Privately", function() {

	suiteSetup("Create Messages", function(done) {
		newMessage1 = new Message("Test Message 1", "TestUser1", "TestUser2", postTime, "Wall", "37", "-100", "Mountain View", 1);
		newMessage2 = new Message("Test Message 2", "TestUser2", "TestUser1", postTime, "Wall", "45", "90", "Los Angeles");
		newMessage3 = new Message("Test Message 3", "TestUser3", "TestUser1", postTime);
    newMessage4 = new Message("Test Message 4", "TestUser4", "TestUser1", postTime);
    newUser1 = createNewUser("TestUser1", "12345");
    newUser2 = createNewUser("TestUser2", "12345");
    db.start(function(connection){
			conn = connection;
			userModel.addUser(newUser1, function(err, addedUser){
				expect(err).to.be(null);
				userModel.addUser(newUser2, function(err, addedUser){
					expect(err).to.be(null);
					done();
				});
			});
		});
	});

  suiteTeardown("Delete Messages", function(done) {
		newMessage1.deleteMessage(function(err) {
			expect(err).to.be(null);
			newMessage2.deleteMessage(function(err) {
				expect(err).to.be(null);
				newMessage3.deleteMessage(function(err) {
					expect(err).to.be(null);
					userModel.deleteUser(newUser1, function(err){
						expect(err).to.be(null);
						userModel.deleteUser(newUser2, function(err){
							expect(err).to.be(null);
							db.close(conn, function(err) {
                done();
							});
						});
					});
				});
			});
		});
	});

  test("No messages between User 1 and User 2", function(done) {
		Message.getPrivateMessages("TestUser1", "TestUser2", function(status, user_list, message_list) {
      expect(message_list).to.be(null);
      done();
    });
  });

	test("Save Messages", function(done) {
		newMessage1.saveMessage(function(status, message) {
			expect(status).to.be(201);
			expect(message).to.not.be(undefined);
			expect(message.messageData).to.be("Test Message 1");
			expect(message.author).to.be("TestUser1");
			expect(message.receiver).to.be("TestUser2");
			expect(message.city).to.be("Mountain View");
			expect(message.currStatus).to.be("OK");
			done();
		});
	});

	test("Status Not Defined", function(done) {
		newMessage2.saveMessage(function(status, message) {
      expect(status).to.be(201);
			expect(message).to.not.be(undefined);
			expect(message.messageData).to.be("Test Message 2");
			expect(message.author).to.be("TestUser2");
			expect(message.receiver).to.be("TestUser1");
			expect(message.currStatus).to.be("Undefined");
			done();
		});
	});

	test("Default Location", function(done) {
		newMessage3.saveMessage(function(status, message) {
			expect(status).to.be(201);
			expect(message).to.not.be(undefined);
			expect(message.messageData).to.be("Test Message 3");
			expect(message.author).to.be("TestUser3");
			expect(message.receiver).to.be("TestUser1");
			expect(message.city).to.be("Unavailable");
			expect(message.latitude).to.be(0);
			expect(message.longitude).to.be(0);
			done();
		});
	});

	test("Get Private Message between User 1 and User 2", function(done) {
		Message.getPrivateMessages("TestUser1", "TestUser2", function(status, user_list, message_list) {
			expect(message_list.length).to.be(2);
			expect(message_list[0].messageData).to.be("Test Message 1");
			expect(message_list[0].author).to.be("TestUser1");
			expect(message_list[0].receiver).to.be("TestUser2");
			expect(message_list[0].city).to.be("Mountain View");
			expect(message_list[0].currStatus).to.be("OK");
			expect(message_list[1].messageData).to.be("Test Message 2");
			expect(message_list[1].author).to.be("TestUser2");
			expect(message_list[1].receiver).to.be("TestUser1");
			expect(message_list[1].city).to.be("Los Angeles");
			expect(message_list[1].currStatus).to.be("Undefined");
			done();
		});
	});

  test("Get Private Message between User 1 and non existing user", function(done) {
		Message.getPrivateMessages("TestUser1", "TestUser5", function(status, user_list, message_list) {
      expect(status).to.be(404);
			expect(message_list).to.be(null);
			done();
		});
	});

});
