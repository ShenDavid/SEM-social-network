process.env.NODE_ENV = 'test';

var expect = require('expect.js'),
	request = require("request"),
	Db = require("../db/db"),
	User = require("../models/user"),
	Message = require("../models/message");
	base_url = "http://localhost:8080/";

var userModel = new User();
var postTime = new Date();
var newMessage1, newMessage2, newMessage3, newMessage4, newMessageWithAttachment;
var newUser1, newUser2;
var db = new Db();
var conn;

var imageAttachment = {
    attachmentType : 2,
    name : "thisisimage.jpg",
    fileUri : "http://testing.com/image.jpg"
};

function createNewUser(name, pw) {
	var newUser = {
		username: name,
		password: pw,
		status: 0,
		type: 0
	};
	return newUser;
}

suite("Chat Publicly", function() {

	suiteSetup("Create Messages", function(done) {
		newMessage1 = new Message("Test Message 1", "TestUser1", "PM", postTime, "Wall", "37", "-100", "Mountain View", 1);
        newMessageWithAttachment = new Message("Test Message 1", "TestUser1", "PM", postTime, "Wall", "37", "-100", "Mountain View", 1, imageAttachment);
		newMessage2 = new Message("Test Message 2", "TestUser2", "PM", postTime, "Wall", "45", "90", "Los Angeles");
		newMessage3 = new Message("Test Message 3", "TestUser3", "", postTime);
		newMessage4 = new Message("Test Message 4", "TestUser4", undefined, postTime);

		newUser1 = createNewUser("TestUser1", "12345");
		newUser2 = createNewUser("TestUser2", "12345");
		db.start(function(connection){
			conn = connection;
			userModel.addUser(newUser1, function(err, addedUser){
				expect(err).to.be(null);
				userModel.addUser(newUser2, function(err, addedUser){
					expect(err).to.be(null);
					User.logout(newUser2.username, function(err, success){
						expect(err).to.be(null);
						expect(success).to.be(true);
						done();
					});
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
					newMessageWithAttachment.deleteMessage(function(err) {
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
	});

	test("No messages in database", function(done) {
		Message.getAllPublicMessages(function(user_list, message_list1) {
			expect(message_list1).to.be(null);
			done();
		});
	});

	test("Save messages with attachment", function(done) {
        newMessageWithAttachment.saveMessage(function(status, message) {
            expect(status).to.be(201);
            expect(message).to.not.be(undefined);
            expect(message.messageData).to.be("Test Message 1");
            expect(message.author).to.be("TestUser1");
            expect(message.receiver).to.be("PM");
            expect(message.city).to.be("Mountain View");
            expect(message.currStatus).to.be("OK");
            expect(message.attachment.name).to.be("thisisimage.jpg");
            expect(message.attachment.fileUri).to.be("http://testing.com/image.jpg");
            expect(message.attachment.attachmentType).to.be(2);
            done();
        });
	});

	test("Save Messages", function(done) {
		newMessage1.saveMessage(function(status, message) {
			expect(status).to.be(201);
			expect(message).to.not.be(undefined);
			expect(message.messageData).to.be("Test Message 1");
			expect(message.author).to.be("TestUser1");
			expect(message.receiver).to.be("PM");
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
			expect(message.receiver).to.be("PM");
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
			expect(message.receiver).to.be("PM");
			expect(message.city).to.be("Unavailable");
			expect(message.latitude).to.be(0);
			expect(message.longitude).to.be(0);
			done();
		});
	});

    /**
	test("Get Public Chat Messages", function(done) {
		Message.getAllPublicMessages(function(user_list, message_list1) {
			expect(message_list1.length).to.be(3);
			expect(message_list1[2].messageData).to.be("Test Message 1");
			expect(message_list1[2].author).to.be("TestUser1");
			expect(message_list1[2].receiver).to.be("PM");
			expect(message_list1[2].city).to.be("Mountain View");
			expect(message_list1[2].currStatus).to.be("OK");
			expect(message_list1[1].messageData).to.be("Test Message 2");
			expect(message_list1[1].author).to.be("TestUser2");
			expect(message_list1[1].receiver).to.be("PM");
			expect(message_list1[1].city).to.be("Los Angeles");
			expect(message_list1[1].currStatus).to.be("Undefined");
			expect(message_list1[0].messageData).to.be("Test Message 3");
			expect(message_list1[0].author).to.be("TestUser3");
			expect(message_list1[0].receiver).to.be("PM");
			expect(message_list1[0].city).to.be("Unavailable");
			expect(message_list1[0].currStatus).to.be("Undefined");
			done();
		});
	});
    **/

	test("Receiver is Empty", function(done){
		newMessage4.saveMessage(function(status, message) {
			expect(status).to.be(201);
			expect(message).to.not.be(undefined);
			expect(message.messageData).to.be("Test Message 4");
			expect(message.author).to.be("TestUser4");
			expect(message.receiver).to.be("PM");
			expect(message.city).to.be("Unavailable");
			expect(message.latitude).to.be(0);
			expect(message.longitude).to.be(0);
			newMessage4.deleteMessage(function(err){
				expect(err).to.be(null);
				done();
			});
		});
	});

	test("Constructor Branches", function(done){
		newMessage5 = new Message("Test Message 5", "TestUser5", undefined, postTime, "Wall", "37", "-100", "Mountain View", 0);
		expect(newMessage5.messageData).to.be("Test Message 5");
		expect(newMessage5.author).to.be("TestUser5");
		expect(newMessage5.currStatus).to.be("Undefined");
		newMessage6 = new Message("Test Message 6", "TestUser6", undefined, postTime, undefined, "37", "-100", "Mountain View", 2);
		expect(newMessage6.receiver).to.be("PM");
		expect(newMessage6.messageType).to.be("Chat");
		expect(newMessage6.latitude).to.be("37");
		expect(newMessage6.longitude).to.be("-100");
		expect(newMessage6.currStatus).to.be("Help");
		newMessage7 = new Message("Test Message 7", "TestUser5", undefined, postTime, "Wall", "37", "-100", "Mountain View", 3);
		expect(newMessage7.city).to.be("Mountain View");
		expect(newMessage7.currStatus).to.be("Emergency");
		done();
	});

});
