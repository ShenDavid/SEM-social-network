process.env.NODE_ENV = 'test';

var expect = require('expect.js'),
	request = require("request"),
	Db = require("../db/db"),
	User = require("../models/user"),
	Announcement = require("../models/announcement");
	base_url = "http://localhost:8080/";

var AnnouncementDb = require('../db/interface/announcementDb');
var postTime = new Date();
var newAnnouncement1, newAnnouncement2, newAnnouncement3, connectVar;
var db = new Db();


suite("Announcement", function() {

	suiteSetup("Create Announcements", function(done) {
		newAnnouncement1 = new Announcement("Test Announcement 1", "TestUser1", postTime, "37", "-100", "Mountain View");
		newAnnouncement2 = new Announcement("Test Announcement 2", "TestUser2", postTime, "45", "90", "Los Angeles");
		newAnnouncement3 = new Announcement("Test Announcement 3", "TestUser1", postTime);
		db.start(function(connection){
			connectVar = connection;
			done();
		});
	});

	suiteTeardown("Delete Announcements", function(done) {
		newAnnouncement1.deleteAnnouncement(function(err) {
			expect(err).to.be(null);
			newAnnouncement2.deleteAnnouncement(function(err) {
				expect(err).to.be(null);
				newAnnouncement3.deleteAnnouncement(function(err) {
					expect(err).to.be(null);
					db.close(connectVar, function(err) {
						done();
					});
				});
			});
		});
	});

	test("No announcements to display", function(done) {
		Announcement.getAnnouncementForRoute(postTime, "TestUser4", function(success, announcement_list, unread, messages, users){
			expect(announcement_list).to.be(null);
			done();
		});
	});

	test("Save Announcements", function(done) {
		newAnnouncement1.saveAnnouncement(function(err, announcement) {
			expect(err).to.be(null);
			expect(announcement).to.not.be(undefined);
			expect(announcement.annData).to.be("Test Announcement 1");
			expect(announcement.author).to.be("TestUser1");
		});
		newAnnouncement2.saveAnnouncement(function(err, announcement) {
			expect(err).to.be(null);
			expect(announcement).to.not.be(undefined);
			expect(announcement.annData).to.be("Test Announcement 2");
			expect(announcement.author).to.be("TestUser2");
			done();
		});
	});

	test("Default Location", function(done) {
		newAnnouncement3.saveAnnouncement(function(err, announcement) {
			expect(err).to.be(null);
			expect(announcement).to.not.be(undefined);
			expect(announcement.annData).to.be("Test Announcement 3");
			expect(announcement.author).to.be("TestUser1");
			expect(announcement.city).to.be("Unavailable");
			expect(announcement.latitude).to.be(0);
			expect(announcement.longitude).to.be(0);
			done();
		});
	});

	test("Retrieve Announcements", function(done) {
		Announcement.getAnnouncementForRoute(postTime, "TestUser4", function(success, announcement_list, unread, messages, users){
			expect(announcement_list).to.not.be(undefined);
			expect(announcement_list.length).to.be(3);
			expect(announcement_list[0].annData).to.be("Test Announcement 1");
			expect(announcement_list[0].author).to.be("TestUser1");
			expect(announcement_list[1].annData).to.be("Test Announcement 2");
			expect(announcement_list[1].author).to.be("TestUser2");
			expect(announcement_list[2].annData).to.be("Test Announcement 3");
			expect(announcement_list[2].author).to.be("TestUser1");
			done();
		});
	});

	test("Pin Announcement", function(done) {
		AnnouncementDb.pinAnnouncement("Test Announcement 1", "TestUser1", function(err){
			Announcement.getAnnouncementForRoute(postTime, "TestUser4", function(success, announcement_list, unread, messages, users){
				expect(announcement_list).to.not.be(undefined);
				expect(announcement_list.length).to.be(3);
				expect(announcement_list[0].annData).to.be("Test Announcement 1");
				expect(announcement_list[0].author).to.be("TestUser1");
				expect(announcement_list[0].pin).to.be(true);
				done();
			});
		});
	});

	test("UnPin Announcement", function(done) {
		AnnouncementDb.unpinAnnouncement("Test Announcement 1", "TestUser1", function(err){
			Announcement.getAnnouncementForRoute(postTime, "TestUser4", function(success, announcement_list, unread, messages, users){
				expect(announcement_list).to.not.be(undefined);
				expect(announcement_list.length).to.be(3);
				expect(announcement_list[0].annData).to.be("Test Announcement 1");
				expect(announcement_list[0].author).to.be("TestUser1");
				expect(announcement_list[0].pin).to.be(false);
				done();
			});
		});
	});
});
