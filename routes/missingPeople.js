var Db = require('../db/db');
var pw = require('../models/password');
var config = require('../config');
var Person = require('../models/person');
var PersonDb = require('../db/interface/personDb');

exports.getMissingPeople = function(req, res, next) {
  //see if user is logged in
  if (!req.session.username){
    res.redirect(302, '/');
  } else {
    var db = new Db();

    //start db connection
    db.start(function(connection){
      var personModel = new Person();

      Person.getAllPersons(function(err, person_list){
        db.close(connection, function(ret){
          res.render('missingPeople', {
            username: req.session.username,
            user: req.session.user,
            person_list: person_list,
          });
        });
      });

    });
  }
};

exports.addMissingPerson = function(req, res, next) {
  var sess = req.session;
  var r = req.params;
  var body = req.body;
  var io = req.app.get('io');
  var statusCode;
  if (!sess.username){
    res.redirect(302, '/');
  } else {
    var db = new Db();
    db.start(function(connection){

      Person.isValidData(body.firstName,body.lastName,body.age,body.location, body.relationship, function(success){


        if(!success) {
          db.close(connection, function(err) {
            res.status(401).send({});
          });

        }
        else {
        Person.samePersonExists(body.firstName,body.lastName,body.age,function(err,person){
          if(err) {
          }
          else {
            if (person != null) {
                db.close(connection, function(err) {
                   res.status(422).send({});
                });
            }
            else {
              statusCode = 201;
              var personModel = new Person(body.firstName,body.lastName,body.age,body.location,r.reporter,body.relationship);
              personModel.savePerson(function(err,person) {
               if(err) {
              }
              else {
                db.close(connection, function(err) {
                 if(err) {
                }
                else {
                  if (statusCode==201){
                    res.status(201).send({person: person});
                    io.emit("addedNewMissingPerson", person);
                  }
                  else if (statusCode == 422) {
                    res.status(422).send({});
                  }
                    //if (io) io.emit('notify_item', item);
                  }
                });
              }
            });
            }
          }
        });
        }
      });

    });
  }
};

exports.changeStatus = function(req, res, next) {
  var io = req.app.get('io');
  //see if user is logged in
  if (!req.session.username){
    res.redirect(302, '/');
  } else {
    var db = new Db();
    //start db connection
    db.start(function(connection){
      Person.changeStatus(req.body.personId, req.params.foundByUser, function(err, person){
        db.close(connection, function(ret){
          res.status(201).send({person:person});
          io.emit("foundMissingPerson", person);
        });
      });

    });
  }
};
