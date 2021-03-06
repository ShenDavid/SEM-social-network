var Db = require('../db/db');
var patrolArea = require('../models/patrolArea');
// var User = require('../models/user');
// var userDb = require('../db/interface/userDb')
// var Message = require('../models/message');
// var Group = require('../models/group');

exports.viewPatrolArea = function(req, res, next) {
    var sess = req.session;
    if (!sess.username){
      res.redirect(302, '/');
    } else {
        console.log("in pa");
        var db = new Db();
        db.start(function(connection) {
            patrolArea.getAllCoordinate(function (area_data) {
                console.log(area_data);
                db.close(connection, function(ret){
                    res.render('patrolArea',{
                        area_data : area_data,
                        user : sess.user
                    });
                });
            });
        });


    }
};

exports.deleteByName = function(req, res){
    var sess = req.session;
    if (!sess.username) {
        res.redirect(302, '/');
    } else {
        var db = new Db();
        //var page = req.body.page;
        var data = {};
        data.name = req.body.name;

        db.start(function(connection){
            patrolArea.deleteByName(data,function(err){
                if(err==false) {
                }
                else {
                    db.close(connection, function(ret){
                        res.status(200).send(err);
                    });
                }
            });
        });
    }
};

exports.addCoordinate = function(req, res){

    var sess = req.session;
    if (!sess.username) {
        res.redirect(302, '/');
    } else {
        var db = new Db();
        //var page = req.body.page;
        var data = {};
        data.coordinates = JSON.parse(req.body.coordinates);
        data.creator = sess.username;
        data.name = req.body.name;

        db.start(function(connection){
            patrolArea.addCoordinate(data,function(err){
                if(err==false) {
                }
                else {
                    console.log("connection");
                    console.log(connection);
                    db.close(connection, function(ret){
                        res.status(200).send(err);
                    });
                }
            });
        });
    }
}
