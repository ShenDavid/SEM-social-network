var Db = require('../db/db');
var utilityLocationDb = require('../db/interface/UtilityLocationDb')
//var Message = require('../models/message');
var Location = require('../models/utilityLocationModel');
//var MessageDb = require('../db/interface/messageDb');
var config = require('../config');



exports.getUtilityLocation = function(req, res, next) {
    var sess = req.session;
    if (!sess.username){
        res.redirect(302, '/');
    } else {
        var db = new Db();
        var utilityID = req.params.utilityID;
        //start db connection
        db.start(function(connection){
            Location.getUtilityLocation(utilityID,function(locations){
                db.close(connection, function(ret){
                    //TODO
                    //res.render('',);
                });
            });
        });
    }
};

exports.insertPreData = function(req, res, next) {
    var sess = req.session;
    if (!sess.username){
        res.redirect(302, '/');
    } else {
        var db = new Db();
      //  var utilityID = req.params.utilityID;
        //start db connection
        db.start(function(connection){
            // Location.insertHospitalPreProcessData(function(locations){
                Location.insertCarsPreProcessData(function(locations){
                    Location.insertIncidentsPreProcessData(function(locations){
                        Location.insertTrucksPreProcessData(function(locations){
                            db.close(connection, function(ret){
                                //TODO
                              // res.render('',);
                            });
                        });
                    });
                });
            // });
        });
    }
};

exports.getUtilityLocationByCategory = function(req, res, next) {
    var sess = req.session;
    if (!sess.username){
        res.redirect(302, '/');
    } else {
        var db = new Db();
        var category = req.params.category;
        //start db connection
        db.start(function(connection){
            Location.getLocationByCategory(category,function(locations){
                db.close(connection, function(ret){
                    //TODO
                    //res.render('',);
                    res.status(200).send(locations);
                });
            });
        });
    }
};

exports.saveUtilityLocation = function(req, res, next) {
    var sess = req.session;
    if (!sess.username){
        res.redirect(302, '/');
    } else {
        var db = new Db();
        var username = sess.username;
        // var location = req.params.location;
        var data = {};
        //data.username = username;
        data.utilityID = req.body.utilityID;
        data.latitude = req.body.latitude;
        data.longitude = req.body.longitude;
        data.address = req.body.address;
        data.category = req.body.category;
        //start db connection
        db.start(function(connection){
            Location.saveUtilityLocation(data,function(success){
                db.close(connection, function(ret){
                    //TODO
                   // res.render('',);

                });
            });
        });
    }
};
