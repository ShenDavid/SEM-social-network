"use strict";
var Promise = require('bluebird');

var mongoose = require('../db/connect');
var bookmark = require('../db/schema/bookmark.js');

var bookmarkModel = mongoose.model('Bookmark', bookmark.bookmarkSchema);

class Bookmark {
    constructor() {}
    
    static getBookmarkByUser(username) {
        return bookmarkModel.find({'username': username});
    }

    static deleteBookmark(data) {
        return bookmarkModel.remove({
            'username': data.username,
            'author': data.author,
            'receiver': data.receiver,
            'postedAt': data.postedAt,
            'messageData': data.messageData
        });
    }

    static addBookmark(data) {
        return bookmarkModel.findOne({
            'username': data.username,
            'author': data.author,
            'receiver': data.receiver,
            'postedAt': data.postedAt,
            'messageData': data.messageData
        })
        .then(exist => {
            if (!exist) {
                var bookmark = new bookmarkModel();

                bookmark.username = data.username;
                bookmark.messageData = data.messageData;
                bookmark.author = data.author;
                bookmark.receiver = data.receiver;
                bookmark.currStatus = data.currStatus;
                bookmark.postedAt = data.postedAt;
                bookmark.city = data.city;
                bookmark.latitude = data.latitude;
                bookmark.longitude = data.longitude;
                
                if (bookmark.attachment) {
                  message.attachment = data.attachment;
                }

                return bookmark.save();
            }
            else {
                return new Promise(function (resolve, reject) {
                    resolve('Bookmark alreay exist');
                });
            }
        })
        .catch(err => {
            return new Promise(function (resolve, reject) {
                reject(err);
            });
        });
    }
}

module.exports = Bookmark;