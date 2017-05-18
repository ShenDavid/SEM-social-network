"use strict";

var Promise = require("bluebird");
var Bookmark = require('../models/bookmark');

exports.getMessages = function(req, res, next) {
	var sess = req.session;
  
	if (!sess.username){
		res.redirect(302, '/');
	}
	else {
		Bookmark.getBookmarkByUser(sess.username)
	    .then(message_list => {
	    	res.render('bookmarkMessage',{
                username: sess.username,
                user: sess.user,
                message_list: message_list
            });
	    }).catch(err => {
	        res.status(500).send(err);
	    });
	}
};

// POST /messages/bookmark
exports.addBookmark = function(req, res, next) {
    Bookmark.addBookmark(req.body)
    .then(() => {
        res.sendStatus(201);
    })
    .catch(err => {
        res.status(500).send(err);
    });
};

// POST /messages/unbookmark
exports.deleteBookmark = function(req, res, next) {
    Bookmark.deleteBookmark(req.body)
    .then(() => {
        res.sendStatus(201);
    })
    .catch(err => {
        res.status(500).send(err);
    });
};