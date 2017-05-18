process.env.NODE_ENV = 'test';

var expect = require('expect.js'),
	request = require("request"),
	Db = require("../db/db"),
	User = require("../models/user"),
	Message = require("../models/message");
	Announcement = require("../models/announcement");
	base_url = "http://localhost:8080/";

var userModel = new User();
var dd1 = new Date();
var n = dd1.toISOString();
var nonlyDate = n.slice(0,10);
var nonlyTime = n.slice(11,19);
var postTime = nonlyDate +" "+ nonlyTime;
var newMessage1, newMessage2, newMessage3, newMessage4;
var newUser1, newUser2;
var db = new Db();
var conn;

function createNewUser(name, pw, status) {
	var newUser = {
		username: name,
		password: pw,
		status: status,
		type: 0
	};
	return newUser;
}

suite("Search Filter Tests", function() {

	suiteSetup("Create Users and Messages", function(done) {
		newUser1 = createNewUser("TestUser1", "12345",0);
		newUser2 = createNewUser("TestUser2", "12345",1);
		newAnnouncement1 = new Announcement("TestAnn1", "TestUser1", dd1, "37", "-100", "Mountain View");
		newAnnouncement2 = new Announcement("Test Ann 2", "TestUser2", dd1, "45", "90", "Los Angeles");
		newAnnouncement3 = new Announcement("Test Ann 3", "TestUser2", dd1, "45", "90", "Los Angeles");
		newAnnouncement4 = new Announcement("Test Ann 4", "TestUser2", dd1, "45", "90", "Los Angeles");
		newAnnouncement5 = new Announcement("Test Ann 5", "TestUser2", dd1, "45", "90", "Los Angeles");
		newAnnouncement6 = new Announcement("Test Ann 6", "TestUser2", dd1, "45", "90", "Los Angeles");
		newAnnouncement7 = new Announcement("Test Ann 7", "TestUser2", dd1, "45", "90", "Los Angeles");
		newAnnouncement8 = new Announcement("Test Ann 8", "TestUser2", dd1, "45", "90", "Los Angeles");
		newAnnouncement9 = new Announcement("Test Ann 9", "TestUser2", dd1, "45", "90", "Los Angeles");
		newAnnouncement10 = new Announcement("Test Ann 10", "TestUser2", dd1, "45", "90", "Los Angeles");
		newAnnouncement11 = new Announcement("Test Ann 11", "TestUser2", dd1, "45", "90", "Los Angeles");
		newAnnouncement12 = new Announcement("Test Ann 12", "TestUser2", dd1, "45", "90", "Los Angeles");
		newMessage1 = new Message("TestMessage1", "TestUser1", "PM", postTime, "Wall", "37", "-100", "Mountain View", 1);
		newMessage2 = new Message("Test Message 2", "TestUser1", "PM", "2016-10-19 02:34", "Wall", "37", "-100", "Mountain View", 1);
		newMessage3 = new Message("Test Message 3", "TestUser2", "PM", "2016-10-29 22:03", "Wall", "37", "-100", "Mountain View", 1);
		newMessage4 = new Message("TestMessage4", "TestUser2", "TestUser1", "2016-10-19 19:36", "Wall", "37", "-100", "Mountain View", 1);
		newMessage5 = new Message("aa2", "TestUser2", "PM", "2016-10-19 19:36", "Wall", "37", "-100", "Mountain View", 1);
		newMessage6 = new Message("aa2", "TestUser2", "PM", "2016-10-18 19:36", "Wall", "37", "-100", "Mountain View", 1);
		newMessage7 = new Message("aa2", "TestUser2", "PM", "2016-10-18 19:36", "Wall", "37", "-100", "Mountain View", 1);
		newMessage8 = new Message("aa2", "TestUser2", "PM", "2016-10-18 19:36", "Wall", "37", "-100", "Mountain View", 1);
		newMessage9 = new Message("aa2", "TestUser2", "PM", "2016-10-18 19:36", "Wall", "37", "-100", "Mountain View", 1);
		newMessage10 = new Message("aa2", "TestUser2", "PM", "2016-10-18 19:36", "Wall", "37", "-100", "Mountain View", 1);
		newMessage11 = new Message("aa2", "TestUser2", "PM", "2016-10-18 19:36", "Wall", "37", "-100", "Mountain View", 1);
		db.start(function(connection){
			conn = connection;
			userModel.addUser(newUser1, function(err, addedUser){
				expect(err).to.be.undefined;
				userModel.addUser(newUser2, function(err, addedUser){
					expect(err).to.be.undefined;
					newAnnouncement1.saveAnnouncement(function(err, announcement) {
						expect(err).to.be.undefined;
					});
					newAnnouncement2.saveAnnouncement(function(err, announcement) {
						expect(err).to.be.undefined;
					});
					newAnnouncement3.saveAnnouncement(function(err, announcement) {
						expect(err).to.be.undefined;
					});
					newAnnouncement4.saveAnnouncement(function(err, announcement) {
						expect(err).to.be.undefined;
					});
					newAnnouncement5.saveAnnouncement(function(err, announcement) {
						expect(err).to.be.undefined;
					});
					newAnnouncement6.saveAnnouncement(function(err, announcement) {
						expect(err).to.be.undefined;
					});
					newAnnouncement7.saveAnnouncement(function(err, announcement) {
						expect(err).to.be.undefined;
					});
					newAnnouncement8.saveAnnouncement(function(err, announcement) {
						expect(err).to.be.undefined;
					});
					newAnnouncement9.saveAnnouncement(function(err, announcement) {
						expect(err).to.be.undefined;
					});
					newAnnouncement10.saveAnnouncement(function(err, announcement) {
						expect(err).to.be.undefined;
					});
					newAnnouncement11.saveAnnouncement(function(err, announcement) {
						expect(err).to.be.undefined;
					});
					newAnnouncement12.saveAnnouncement(function(err, announcement) {
						expect(err).to.be.undefined;
					});
					newMessage1.saveMessage(function(err, message) {
						expect(err).to.be.undefined;
					});
					newMessage2.saveMessage(function(err, message) {
						expect(err).to.be.undefined;
					});
					newMessage3.saveMessage(function(err, message) {
						expect(err).to.be.undefined;
					});
					newMessage4.saveMessage(function(err, message) {
						expect(err).to.be.undefined;
					});
					newMessage5.saveMessage(function(err, message) {
						expect(err).to.be.undefined;
					});
					newMessage6.saveMessage(function(err, message) {
						expect(err).to.be.undefined;
					});
					newMessage7.saveMessage(function(err, message) {
						expect(err).to.be.undefined;
					});
					newMessage8.saveMessage(function(err, message) {
						expect(err).to.be.undefined;
					});
					newMessage9.saveMessage(function(err, message) {
						expect(err).to.be.undefined;
					});
					newMessage10.saveMessage(function(err, message) {
						expect(err).to.be.undefined;
					});
					newMessage11.saveMessage(function(err, message) {
						expect(err).to.be.undefined;
					});
					done();
				});
			});
		});
	});
	suiteTeardown("Delete users and Messages", function(done) {
		newAnnouncement1.deleteAnnouncement(function(err) {
		expect(err).to.be.undefined;
		newAnnouncement2.deleteAnnouncement(function(err) {
		expect(err).to.be.undefined;
		newAnnouncement3.deleteAnnouncement(function(err) {
		expect(err).to.be.undefined;
		newAnnouncement4.deleteAnnouncement(function(err) {
		expect(err).to.be.undefined;
		newAnnouncement5.deleteAnnouncement(function(err) {
		expect(err).to.be.undefined;
		newAnnouncement6.deleteAnnouncement(function(err) {
		expect(err).to.be.undefined;
		newAnnouncement7.deleteAnnouncement(function(err) {
		expect(err).to.be.undefined;
		newAnnouncement8.deleteAnnouncement(function(err) {
		expect(err).to.be.undefined;
		newAnnouncement9.deleteAnnouncement(function(err) {
		expect(err).to.be.undefined;
		newAnnouncement10.deleteAnnouncement(function(err) {
		expect(err).to.be.undefined;
		newAnnouncement11.deleteAnnouncement(function(err) {
		expect(err).to.be.undefined;
		newAnnouncement12.deleteAnnouncement(function(err) {
		expect(err).to.be.undefined;
			newMessage1.deleteMessage(function(err) {
			expect(err).to.be.undefined;
			newMessage2.deleteMessage(function(err) {
			expect(err).to.be.undefined;
			newMessage3.deleteMessage(function(err) {
			expect(err).to.be.undefined;
			newMessage4.deleteMessage(function(err) {
			expect(err).to.be.undefined;
			newMessage5.deleteMessage(function(err) {
			expect(err).to.be.undefined;
			newMessage6.deleteMessage(function(err) {
			expect(err).to.be.undefined;
			newMessage7.deleteMessage(function(err) {
			expect(err).to.be.undefined;
			newMessage8.deleteMessage(function(err) {
			expect(err).to.be.undefined;
			newMessage9.deleteMessage(function(err) {
			expect(err).to.be.undefined;
			newMessage10.deleteMessage(function(err) {
			expect(err).to.be.undefined;
			newMessage11.deleteMessage(function(err) {
			expect(err).to.be.undefined;
				userModel.deleteUser(newUser1, function(err){
				expect(err).to.be.undefined;
				userModel.deleteUser(newUser2, function(err){
				expect(err).to.be.undefined;
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
			});
			});
			});
			});
			});
			});
		});
		});
		});
		});
		});
		});
		});
		});
		});
		});
		});
		});
	});

	test("Filter Users by username", function(done) {
		User.getMatchingUsers("TestUser1", function(err,user_list){
			expect(err).to.be.undefined;
			expect(user_list[0].username).to.be("TestUser1");
			done();
		});
	});

	test("Filter Users by incomplete username", function(done) {
		User.getMatchingUsers("User1", function(err,user_list){
			expect(err).to.be.undefined;
			expect(user_list[0].username).to.be("TestUser1");
			done();
		});
	});

	test("Filter Users by non-existing username", function(done) {
		User.getMatchingUsers("blahhhh", function(err,user_list){
			expect(err).to.be.undefined;
			expect(user_list).to.be(null);
			done();
		});
	});

	test("Filter undefined status", function(done) {
		User.getMatchingUsersWithStatus(0, function(err,user_list){
			expect(err).to.be.undefined;
			expect(user_list[0].username).to.be("TestUser1");
			done();
		});
	});

	test("Filter OK status", function(done) {
		User.getMatchingUsersWithStatus(1, function(err,user_list){
			expect(err).to.be.undefined;
			expect(user_list[0].username).to.be("TestUser2");
			done();
		});
	});

	// Search public msg
	test("Filter public message by content", function(done) {
		Message.searchMessagesBy("TestUser1", "Message", 1, "", function(message_list1){
			expect(message_list1.length).to.be(3);
			expect(message_list1[0].messageData).to.be("TestMessage1");
			expect(message_list1[0].author).to.be("TestUser1");
			expect(message_list1[0].receiver).to.be("PM");
			expect(message_list1[0].city).to.be("Mountain View");
			expect(message_list1[0].currStatus).to.be("OK");
			expect(message_list1[1].messageData).to.be("Test Message 3");
			expect(message_list1[1].author).to.be("TestUser2");
			expect(message_list1[1].receiver).to.be("PM");
			expect(message_list1[1].city).to.be("Mountain View");
			expect(message_list1[1].currStatus).to.be("OK");
			expect(message_list1[2].messageData).to.be("Test Message 2");
			expect(message_list1[2].author).to.be("TestUser1");
			expect(message_list1[2].receiver).to.be("PM");
			expect(message_list1[2].city).to.be("Mountain View");
			expect(message_list1[2].currStatus).to.be("OK");
			done();
		});
	});

	// 10 limit
	test("Filter public message by content limit by 10", function(done) {
		Message.searchMessagesBy("TestUser1", "Message aa", 1, "", function(message_list1){
			expect(message_list1.length).to.be(10);
			done();
		});
	});

	// Load more older
	test("Load more older public message by content", function(done) {
		Message.searchMessagesBy("TestUser1", "Message aa", 1, "2016-10-18 20:36", function(message_list1){
			expect(message_list1.length).to.be(6);
			done();
		});
	});

	// Search private msg
	test("Filter private message by content", function(done) {
		Message.searchMessagesBy("TestUser2", "Message", 2, "", function(message_list1){
			expect(message_list1.length).to.be(1);
			expect(message_list1[0].messageData).to.be("TestMessage4");
			expect(message_list1[0].author).to.be("TestUser2");
			expect(message_list1[0].receiver).to.be("TestUser1");
			expect(message_list1[0].city).to.be("Mountain View");
			expect(message_list1[0].currStatus).to.be("OK");
			done();
		});
	});

	// Search on private msg should not get public msg
	test("Filter private message by content and username", function(done) {
		Message.searchMessagesBy("TestUser1", "TestMessage1", 2, "", function(message_list1){
			expect(message_list1).to.be.undefined;
			done();
		});
	});

	// Vice versa
	test("Filter public message by content and receiver", function(done) {
		Message.searchMessagesBy("TestUser2", "TestMessage4", 1, "", function(message_list1){
			expect(message_list1).to.be.undefined;
			done();
		});
	});

	// Search both with incomplete content
	test("Filter public and private message by incomplete content", function(done) {
		Message.searchMessagesBy("TestUser2", "Message", 0, "", function(message_list1, message_list2){
			expect(message_list1.length).to.be(3);
			expect(message_list1[0].messageData).to.be("TestMessage1");
			expect(message_list1[0].author).to.be("TestUser1");
			expect(message_list1[0].receiver).to.be("PM");
			expect(message_list1[0].city).to.be("Mountain View");
			expect(message_list1[0].currStatus).to.be("OK");
			expect(message_list1[1].messageData).to.be("Test Message 3");
			expect(message_list1[1].author).to.be("TestUser2");
			expect(message_list1[1].receiver).to.be("PM");
			expect(message_list1[1].city).to.be("Mountain View");
			expect(message_list1[1].currStatus).to.be("OK");
			expect(message_list1[2].messageData).to.be("Test Message 2");
			expect(message_list1[2].author).to.be("TestUser1");
			expect(message_list1[2].receiver).to.be("PM");
			expect(message_list1[2].city).to.be("Mountain View");
			expect(message_list1[2].currStatus).to.be("OK");
			expect(message_list2.length).to.be(1);
			expect(message_list2[0].messageData).to.be("TestMessage4");
			expect(message_list2[0].author).to.be("TestUser2");
			expect(message_list2[0].receiver).to.be("TestUser1");
			expect(message_list2[0].city).to.be("Mountain View");
			expect(message_list2[0].currStatus).to.be("OK");
			done();
		});
	});

	// Search for a non-existing pattern
	test("Filter public and private message by non-existing content", function(done) {
		Message.searchMessagesBy("asdfghjkl", "Message", 0, "", function(message_list1, message_list2){
			expect(message_list1).to.be.undefined;
			expect(message_list2).to.be.undefined;
			done();
		});
	});

	test("Filter announcement by content", function(done) {
		Announcement.searchDBAnnouncementsBy("TestAnn1", "", function(err, msg){
			expect(err).to.be.undefined;
			expect(msg.length).to.be(1);
			expect(msg[0].annData).to.be("TestAnn1");
			done();
		});
	});

	// 10 limit
	test("Filter announcement by content and limit by 10", function(done) {
		Announcement.searchDBAnnouncementsBy("Ann", "", function(err, msg){
			expect(err).to.be.undefined;
			expect(msg.length).to.be(10);
			done();
		});
	});

	// Load more older
	test("Filter announcement by content and load more", function(done) {
		Announcement.searchDBAnnouncementsBy("Ann", "Wed Dec 26 2016 02:34:24 GMT-0700 (PDT)", function(err, msg){
			expect(err).to.be.undefined;
			done();
		});
	});


	test("Filter announcement by non-existing content", function(done) {
		Announcement.searchDBAnnouncementsBy("Announcementtttt", "", function(err, msg){
			expect(err).to.be.undefined;
			expect(msg).to.be.undefined;
			done();
		});
	});

});
