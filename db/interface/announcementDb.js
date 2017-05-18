'use strict';

var mongoose = require('mongoose');
var announcement = require('../schema/announcement.js');

var AnnouncementModel = mongoose.model('Announcement', announcement.announcementSchema);

class announcementDb {
  constructor(){}
  
  addAnnouncement(data, callback){
    var ann = new AnnouncementModel();
    ann.annData = data.annData;
    ann.author = data.author;
    ann.city = data.city;
    ann.latitude = data.latitude;
    ann.longitude = data.longitude;

    ann.save(function(err){
        callback(err, ann);
    });
  }

  static pinAnnouncement(announcementText, author, callback){
    AnnouncementModel.findOne({'annData':announcementText,'author':author}, function(err, announcement){
      announcement.pin = true;
      announcement.save(function(err) {
        callback(err);
      });
    });
  }

  static unpinAnnouncement(announcementText, author, callback){
    AnnouncementModel.findOne({'annData':announcementText,'author':author}, function(err, announcement){
      announcement.pin = false;
      announcement.save(function(err) {
        callback(err);
      });
    });
  }

  getAnnouncements(callback){
    var getAllAnnouncements = AnnouncementModel.find({});
    
    getAllAnnouncements.sort({'pin': -1, 'postedAt': 1}).limit(100).exec(function(err, announcements){
      if (err){
        callback(false, null);
      }
      else if (announcements.length === 0){
        callback(true, null);
      }
      else {
        callback(true, announcements);
      }
    });
  }

  searchAnnouncementsBy(keyword, lastTime, callback){
    var getAllAnnouncements;
    if(lastTime=="")
      getAllAnnouncements = AnnouncementModel.find({'annData':  {'$regex' : keyword}});
    else
      getAllAnnouncements = AnnouncementModel.find({'postedAt':{$lt:new Date(lastTime)}, 'annData':  {'$regex' : keyword}});
    getAllAnnouncements.sort({'postedAt':-1}).limit(10).exec(function(err, announcements){
      if (err){
        callback(false, null);
      } else if (announcements.length == 0){
        callback(true, null);
      } else {
        callback(true, announcements);
      }
    });
  }

  updateAnnouncementAuthor(old_username, new_username, callback){
    AnnouncementModel.find({'author': old_username}, function(err, ann_list){
      //if error exists
      if(err){
        callback(err);
      } else {
        //no error but announcements may be empty
        if(!ann_list){
          callback(err);
        }
        //if not empty then change all the names to the new username
        for(var i = 0; i < ann_list.length; i++){
          ann_list[i].author = new_username;
          ann_list[i].save(function(err, record, numAffect){
            //if there is an error in saving the new username
            if(err){
              callback(err);
            }
          });
        }
        //else return that there were no errors
        callback(err);
      }
    });
  }

  deleteAnnouncement(announcementText, author, callback) {
    AnnouncementModel.find({'annData':announcementText,'author':author}).remove(function(err) {
      callback(err);
    });
  }
}

module.exports = announcementDb;