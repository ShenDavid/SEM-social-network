var Db = require('../db/db');
var Reach911 = require('../models/Reach911');
var User = require('../models/user');
var dispatchers = [];
var Patient = require('../models/patient');
var Incident = require("../models/incident.js");

exports.showMap = function(req, res) {
    var sess = req.session;
    if (!sess.username) {
        res.redirect(302, '/');
    } else {
        res.render('reach911', {
            user: req.session.user,
            username: req.session.username,
            incident: {}
        });
    }
};

exports.showPatient = function(req, res) {
    var sess = req.session;
    if (!sess.username) {
        res.redirect(302, '/');
    } else {
        res.render('reach911-3');
    }
};

exports.showEmer = function(req, res) {
    var sess = req.session;
    if (!sess.username) {
        res.redirect(302, '/');
    } else {
        res.render('reach911-2');
    }
};

function SortCount(a, b){
    return a["count"] - b["count"];
}
function calculate(users, callback){
    var i = 0;
    users.forEach(function(user){


        // console.log(users[i]);
        var temp_obj = {};

        if(user.type == 3 || user == users[users.length - 1]){
            console.log(user);

            Reach911.findDispatcherByName(user.username, function(err, result){
                console.log("result");
                console.log(result);
                if(err){
                    if(user.type != 3){
                        callback("blabla");
                    }
                    else {
                        temp_obj["uname"] = user.username;
                        temp_obj["count"] = 0;
                        dispatchers[i++] = temp_obj;
                    }
                }
                else{
                    temp_obj["uname"] = user.username;
                    temp_obj["count"] = result;
                    dispatchers[i++] = temp_obj;
                }
                //console.log(dispatchers);
            });

        }
    })

}

exports.assignDispatcher = function(req, res){

    var db = new Db();
    //console.log("in assgin");
    db.start(function(connection){
        Reach911.getAllUsers(function(err, users){
            // calculate(users, function(temps){
            //     console.log("this is temps");
            //     console.log(temps);
            //     if(temps === "blabla") {
            //         console.log("dispat");
            //         dispatchers.sort(SortCount);
            //         console.log(dispatchers);
            if(err){
                db.close(connection, function (ret) {
                    res.status(404).send(err);
                });

            }
            else{
                db.close(connection, function (ret) {
                    res.status(200).send(users);
                });
            }

            //     }
            //
            // });

        });
    });
};

exports.countDispatcher = function(req, res){
    var sess = req.session;
    if (!sess.username){
        res.redirect(302, '/');
    } else {
        var db = new Db();
        var username = req.params.username;
        //start db connection
        db.start(function(connection){
            Reach911.findDispatcherByName(username, function(err, result){
                db.close(connection, function(ret){
                    res.status(200).send(result);
                    // if(err){
                    //     res.sendStatus(400).send(result);
                    // }
                    // else {
                    //     res.sendStatus(200).send(result);
                    // }
                });
            });
        });
    }
}

exports.saveEmergency = function(req,res){
    var sess = req.session;
    if (!sess.username) {
        res.redirect(302, '/');
    } else {
        var db = new Db();
        //var page = req.body.page;
        var data = {};
        data.date = Date.now();
        data.caller = sess.username;
        data.type = req.body.type;
        data.dispatcher = req.body.dispatcher;
        data.incidentId = Incident.generateIncidentId(data);

        if(data.type == "Medical") {
            data.address = req.body.address;
            data.isPatient = req.body.isPatient;
            data.age = req.body.age;
            data.sex = req.body.sex;
            data.conscient = req.body.conscient;
            data.breathing = req.body.breathing;
            data.complaint = req.body.complaint;

        }
        else if(data.type == "Fire") {
            data.address = req.body.address;
            data.smoke = req.body.smoke;
            data.smokecolor = req.body.smokecolor;
            data.flame = req.body.flame;
            data.smokequantity = req.body.smokequantity;
            data.injury = req.body.injury;
            data.hmaterial = req.body.hmaterial;
            data.getout = req.body.getout;
            data.insidePeople = req.body.insidePeople;
            data.structype = req.body.structype;

        }
        else if(data.type == "Police") {
            data.address = req.body.address;
            data.suspect = req.body.suspect;
            data.injured = req.body.injured;
            data.vehicle = req.body.vehicle;
            data.safe = req.body.safe;
            data.left = req.body.left;
            data.means = req.body.means;
            data.travel = req.body.travel;
            data.detail = req.body.detail;

        }


        db.start(function(connection){
            //console.log(connection);
            Reach911.saveByCaller(data,function(err){
                db.close(connection, function(ret){
                    if(err == false){
                        res.status(404).send(err);
                        console.log(err);
                    }
                    else {
                        res.status(200).send(err);
                    }
                });

            });
        });
    }
};

exports.savePatient = function (req, res) {
    var sess = req.session;
    if (!sess.username) {
        res.redirect(302, '/');
    } else {
        var db = new Db();
        //var page = req.body.page;
        var data = {};
        data.date = Date.now();
        data.caller = sess.username;
        data.type = req.body.type;
        data.dispatcher = req.body.dispatcher;
        data.address = req.body.address;
        data.isPatient = req.body.isPatient;
        data.incidentId = Incident.generateIncidentId(data);

        {
            if(data.isPatient == "Yes") {
                var patientData = {};
                patientData.incidentId = data.incidentId;
                patientData.id = Incident.generatePatientId(data, 0);
                patientData.name = sess.username;
                patientData.age = parseInt(req.body.age);
                patientData.sex = (req.body.sex == "Female");
                patientData.normalBreathing = req.body.breathing == "Yes";
                patientData.conscious = req.body.conscient == "Yes";
                patientData.complaint = req.body.complaint;
                patientData.priority = 0;
                // TODO: Set condition properly
                // patientData.condition = 1;
                console.log(patientData);

                Patient.createPatient(patientData).then(addPatientData => {
                    console.log("add patient here");
                    console.log(addPatientData);
                    var returnedPatient = addPatientData;

                    data.patientlist = [patientData.id];

                    db.start(function (connection) {
                        //console.log(connection);
                        Reach911.saveReturnID(data, function (rs) {
                            db.close(connection, function (ret) {
                                if (rs == null) {
                                    res.status(404).send(false);
                                }
                                else {
                                    res.status(200).send(data);
                                }
                            });

                        });
                    });
                }).
                    catch(err => res.status(404).send(false));
            }
            else{
                var patientarr = [];
                data.patientlist = patientarr;

                db.start(function (connection) {
                    //console.log(connection);
                    Reach911.saveReturnID(data, function (rs) {
                        db.close(connection, function (ret) {
                            if (rs == null) {
                                res.status(404).send(false);
                            }
                            else {
                                console.log("this is rs");
                                console.log(rs);

                            }
                        });

                    });
                });


                res.status(200).send(true);
            }
        }



    }
}

exports.getEmergencyByCaller = function(req,res){
    var sess = req.session;
    if (!sess.username) {
        res.redirect(302, '/');
    } else {
        var db = new Db();
        var caller = req.body.caller;
        db.start(function(connection){
            Reach911.getByCaller(caller,function(rs){
               // if(err==false) {
               // }
               // else {
                    db.close(connection, function(ret){
                        res.status(200).send(rs);
                    });
               // }
            });
        });
    }
}
