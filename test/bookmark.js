/**
 * Created by Shicheng Xu on 17/3/17
 */
process.env.NODE_ENV = 'test';

var expect = require('expect.js');
var Bookmark = require("../models/bookmark");

var bookmark1 = {
    "username": "ESNAdmin",
    "longitude" : -122.05967679999999,
    "latitude" : 37.4104081,
    "postedAt" : "2017-04-30 02:16:05",
    "author" : "ESNAdmin",
    "messageData" : "Hello",
    "city" : "Mountain View",
    "currStatus" : "OK",
    "receiver" : "Public",
    "messageType" : "Wall"
};

suite("Bookmark Tests", function() {
    suiteSetup(function (done) {
        done();
    });

    suiteTeardown(function (done) {
        done();
    });

    test("can add bookmark", function (done) {
        Bookmark.addBookmark(bookmark1)
        .then(() => {
            done();
        })
        .catch(err => {
            done(err);
        });
    });

    test("can't add duplicated bookmark", function (done) {
        Bookmark.addBookmark(bookmark1)
        .then(err => {
            expect(err).to.be("Bookmark alreay exist");
            done();
        })
        .catch(err => {
            done(err);
        });
    });

    test("can get bookmark by username", function (done) {
        Bookmark.getBookmarkByUser("ESNAdmin")
        .then(bookmark_list => {
            expect(bookmark_list.length).to.be(1);
            expect(bookmark_list[0].messageData).to.be("Hello");
            expect(bookmark_list[0].city).to.be("Mountain View");
            expect(bookmark_list[0].postedAt).to.be("2017-04-30 02:16:05");
            done();
        })
        .catch(err => {
            done(err);
        });
    })

    test("can delete bookmark", function (done) {
        Bookmark.deleteBookmark(bookmark1)
        .then(() => {
            done();
        })
        .catch(err => {
            done(err);
        });
    });

    test("check if delete succeed", function (done) {
        Bookmark.getBookmarkByUser("ESNAdmin")
        .then(bookmark_list => {
            expect(bookmark_list.length).to.be(0);
            done();
        })
        .catch(err => {
            done(err);
        });
    })
});
