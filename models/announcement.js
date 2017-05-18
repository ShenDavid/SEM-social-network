'use strict';

var AnnouncementDb = require('../db/interface/announcementDb');
var MessageDb = require('../db/interface/messageDb');
var UserDb = require('../db/interface/userDb');

class Announcement {
  constructor(annData, author, postedAt, latitude, longitude, city){

    this.annData = annData;
    this.author = author;
    this.postedAt = postedAt;

    //if location is empty
    if (!city) {
      this.city = "Unavailable";
      this.latitude = 0;
      this.longitude = 0;
    }
    else {
      this.city = city;
      this.latitude = latitude;
      this.longitude = longitude;
    }

  }

  saveAnnouncement(callback) {
    var announcementDbInst = new AnnouncementDb();
    var announcement = this;
    announcementDbInst.addAnnouncement(announcement, function(err, annData){
    callback(err, annData);
    });
  }

  static searchDBAnnouncementsBy(keyword, lastTime, callback) {
    var announcementDbInst = new AnnouncementDb();
    var regex =".*(";
    var strarr = keyword.split(" ");
    var i;
    for (i = 0; i < strarr.length - 1; i++) {
      if(strarr[i].length!=0)
        regex+=strarr[i]+"|";
    };
    if(strarr[i].length!=0)
      regex+=strarr[i];
    else
      regex=regex.substr(0, regex.length - 1);
    regex+=").*";
    announcementDbInst.searchAnnouncementsBy(regex, lastTime, function(err, msg) {
      callback(err, msg);
    });
  }

  deleteAnnouncement(callback) {
    var announcementDbInst = new AnnouncementDb();
    announcementDbInst.deleteAnnouncement(this.annData, this.author,  function(err) {
      callback(err);
    });
  }

  static updateAnnouncementWithNewUsername(old_username, new_username, callback) {
    var announcementDbInst = new AnnouncementDb();
    announcementDbInst.updateAnnouncementAuthor(old_username, new_username, function(err){
      callback(err);
    });
  }

  static getAnnouncementForRoute(lastLogoutAt, username, callback){
    var announcementDbInst = new AnnouncementDb();
    var messageDbInst = new MessageDb();
    var userDbInst = new UserDb();
    announcementDbInst.getAnnouncements(function(success, announcement_list) {
      messageDbInst.checkAfter(lastLogoutAt,username,function(success2, unread, messages) {
        userDbInst.getAllUsers(function(err, user_list){
          callback((success && success2), announcement_list, unread, messages, user_list);
        });
      });
    });
  }
}

module.exports = Announcement;
