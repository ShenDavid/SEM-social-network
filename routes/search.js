var Db = require('../db/db');
var Status = require('../models/status');
var User = require('../models/user');
var UserDb = require('../db/interface/userDb');
var StatusDb = require('../db/interface/statusDb');
var Message = require('../models/message');
var Announcement = require('../models/announcement');
var Person = require('../models/person');
//search refactoring
var Contact = require('../models/contact');
var Group = require('../models/group');

exports.searchData = function(req, res, next) {
  var sess = req.session;
  var keyword = req.query.keyword;
  if (!sess.username){
    res.redirect(302, '/');
  }
  else if (keyword === undefined) {
    res.render('search', {
      username: req.session.user.username,
      user: req.session.user});
  }
  else {
    var db = new Db();
    //search refactoring
    var contact = new Contact();
    var users;
    var stopwords=/(\ba\b|\bable\b|\babout\b|\bacross\b|\bafter\b|\ball\b|\balmost\b|\balso\b|\bam\b|\bamong\b|\ban\b|\band\b|\bany\b|\bare\b|\bas\b|\bat\b|\bbe\b|\bbecause\b|\bbeen\b|\bbut\b|\bby\b|\bcan\b|\bcannot\b|\bcould\b|\bdear\b|\bdid\b|\bdo\b|\bdoes\b|\beither\b|\belse\b|\bever\b|\bevery\b|\bfor\b|\bfrom\b|\bget\b|\bgot\b|\bhad\b|\bhas\b|\bhave\b|\bhe\b|\bher\b|\bhers\b|\bhim\b|\bhis\b|\bhow\b|\bhowever\b|\bi\b|\bif\b|\bin\b|\binto\b|\bis\b|\bit\b|\bits\b|\bjust\b|\bleast\b|\blet\b|\blike\b|\blikely\b|\bmay\b|\bme\b|\bmight\b|\bmost\b|\bmust\b|\bmy\b|\bneither\b|\bno\b|\bnor\b|\bnot\b|\bof\b|\boff\b|\boften\b|\bon\b|\bonly\b|\bor\b|\bother\b|\bour\b|\bown\b|\brather\b|\bsaid\b|\bsay\b|\bsays\b|\bshe\b|\bshould\b|\bsince\b|\bso\b|\bsome\b|\bthan\b|\bthat\b|\bthe\b|\btheir\b|\bthem\b|\bthen\b|\bthere\b|\bthese\b|\bthey\b|\bthis\b|\btis\b|\bto\b|\btoo\b|\btwas\b|\bus\b|\bwants\b|\bwas\b|\bwe\b|\bwere\b|\bwhat\b|\bwhen\b|\bwhere\b|\bwhich\b|\bwhile\b|\bwho\b|\bwhom\b|\bwhy\b|\bwill\b|\bwith\b|\bwould\b|\byet\b|\byou\b|\byour\b)/gi;
    var filteredKeyword = req.query.keyword.replace(stopwords, "");
    var statusVal = -1;

    if (filteredKeyword.toLowerCase() === "undefined") statusVal = 0;
    else if (filteredKeyword.toLowerCase() === "ok") statusVal = 1;
    else if (filteredKeyword.toLowerCase() === "help") statusVal = 2;
    else if (filteredKeyword.toLowerCase() === "emergency") statusVal = 3;



    //start db connection
    db.start(function(connection){

      // The below if is for loading 10 more public messages. Will work on this later.
      if(req.query.more=="public"){
        Message.searchMessagesBy(sess.username,filteredKeyword,1,req.query.lastTime,function(message_list){
          db.close(connection, function(ret){
            res.status(201).send(message_list);
          });
        });
      }
      else if(req.query.more=="private"){
        Message.searchMessagesBy(sess.username,filteredKeyword,2,req.query.lastTime,function(message_list2){
          db.close(connection, function(ret){
            res.status(201).send(message_list2);
          });
        });
      }
      else if(req.query.more=="ann"){
        Announcement.searchDBAnnouncementsBy(filteredKeyword, req.query.lastTime, function(success, announcement_list){
          db.close(connection, function(ret){
            res.status(201).send(announcement_list);
          });
        });
      }
      else

      // Normal case, return everything.
    Announcement.searchDBAnnouncementsBy(filteredKeyword, "", function(success, announcement_list){
      // User.getMatchingUsers(filteredKeyword,function(err, user_list){
        Message.searchMessagesBy(sess.username,filteredKeyword,0,"",function(message_list, message_list2){

          Person.getMatchingPersons(filteredKeyword,function(err,person_list){


            User.getMatchingUsersWithStatus(statusVal,function(err, status_list){
              //search refactoring
              contact.getMatchingContactByUserRole(filteredKeyword, req.session.user.type, function(err, contact_list){
                Group.getMatchingGroups(filteredKeyword, req.session.user.username).then((group_list) => {

                    db.close(connection, function(ret){
                      res.render('search',{
                        author: sess.username,
                        username: sess.username,
                        user: sess.user,
                        // user_list: user_list,
                        announcement_list: announcement_list,
                        message_list: message_list,
                        message_list2: message_list2,
                        status_list: status_list,
                        person_list:person_list,
                        keyword: filteredKeyword,
                        contact_list: contact_list,
                        group_list1: group_list[0],
                        group_list2: group_list[1]
                      })
                      // .catch(err => res.status(500).send(err));;
                    });
                  });
                  });
                });

              });
            });
          // });
        });

});
}
};
