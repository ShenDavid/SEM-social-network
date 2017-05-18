var Db = require('../db/db');
//var User = require('../models/user');
var userLocationDb = require('../db/interface/UserLocationDb')
//var Message = require('../models/message');
var Location = require('../models/userLocationModel');
//var MessageDb = require('../db/interface/messageDb');
var config = require('../config');



exports.getUserLocation = function(req, res, next) {
    var sess = req.session;
    if (!sess.username){
        res.redirect(302, '/');
    } else {
        var db = new Db();
        var username = sess.username;
        //start db connection
        db.start(function(connection){
            Location.getUserLocation(username,function(locations){
                db.close(connection, function(ret){
                    res.status(200).send(locations);

                });
            });
        });
    }
};

exports.getMemberLocation = function(req, res, next) {
    var sess = req.session;
    if (!sess.username){
        res.redirect(302, '/');
    } else {
        var db = new Db();
        var username = req.params.username;
        //console.log(username);
        //start db connection
        db.start(function(connection){
            Location.getUserLocation(username,function(locations){
                console.log("in route");
                console.log(locations);
                db.close(connection, function(ret){
                    res.status(200).send(locations);

                });
            });
        });
    }
};

exports.getContactLocation = function(req, res, next) {
    var sess = req.session;
    if (!sess.username){
        res.redirect(302, '/');
    } else {
        var db = new Db();
        var username = req.params.username;
        //start db connection
        db.start(function(connection){
            Location.getUserLocation(username,function(locations){
                db.close(connection, function(ret){
                    res.status(200).send(locations);

                });
            });
        });
    }
};

exports.saveUserLocation = function(req, res, next) {
    var sess = req.session;
    if (!sess.username){
        res.redirect(302, '/');
    } else {
        var db = new Db();
        var data = {};
        data.username = sess.username;
        data.latitude = req.body.latitude;
        data.longitude = req.body.longitude;
        data.address = req.body.address;
        //start db connection
        db.start(function(connection){
            Location.saveUserLocation(data,function(success){
                db.close(connection, function(ret){

                    //TODO
                   // res.render('',);

                });
            });
        });
    }
};