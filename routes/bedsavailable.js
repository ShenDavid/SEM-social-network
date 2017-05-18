/**
 * Created by rajkiran on 4/6/17.
 */

var Db = require('../db/db');
var Hospital = require('../models/hospital');

// GET /hospital/getHospitalByName/:name
exports.renderAvailableBeds = function(req, res) {
    var db = new Db();
    var hospitalModel = new Hospital();
    var name = req.params.name;
    var user = req.session.user;
    if( user === undefined ) { 
        res.redirect( 302, '/' );
    } else {
        db.start(function(connection){
            hospitalModel.getHospitalByNurseName(req.session.user.username, function(err, hospital){
                if (err || hospital == null) {
                    db.close(connection, function(ret){
                        res.render('bedsAvailable', {
                            username: req.session.user.username,
                            user: req.session.user,
                            beds_available: -1,
                            hospital_name : null
                        });
                        console.log('db error when getting hospital by nurse name');
                    });
                }
                else {
                    db.close(connection, function(ret){
                        res.render('bedsAvailable', {
                            username: req.session.user.username,
                            user: req.session.user,
                            beds_available: hospital.beds,
                            hospital_name : hospital.name
                        });
                        console.log(hospital.beds);
                        console.log(hospital.name);
                        console.log('get hospital by name succussfully');
                    });
                }
            });
        });
    }
};

exports.updateBeds = function( req, res ){
    // POST /hospital/deleteHospital
        var db = new Db();
        var hospitalModel = new Hospital();
        var beds_count = req.body.beds;
        db.start(function(connection) {
                hospitalModel.updateBedsAvailableByNurseName(req.session.user.username, beds_count, function (err) {
                    db.close(connection, function (ret) {
                        if (err) {
                            res.sendStatus(500);
                            console.log('failed to update');
                        }
                        else {
                            res.sendStatus(201);
                            console.log('updated successfully');
                        }
                    });
                });
        });
};
