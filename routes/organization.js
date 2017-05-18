var Db = require('../db/db');
var User = require('../models/user');
var Organization = require('../models/organization');
var Vehicle = require('../models/vehicle');
var userDb = require('../db/interface/userDb');
var Message = require('../models/message');
var MessageDb = require('../db/interface/messageDb');
var config = require('../config');
var Group = require('../models/group');


exports.getOrganization = function(req, res, next) {
    //see if user is logged in
    // if (!req.session.username || req.session.user.type % 10 != 1) {
    //     res.redirect(302, '/');
    // }
    if(true) {
        var db = new Db();
        //start db connection

        Vehicle.getAllVehicleInfo().then((vehicle) => {
            db.start(function (connection) {
                //Get all responders
                User.getAllResponders(function (err, responders) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        User.getAllChiefs(function (err, chiefs) {
                            if (err) {
                                console.log(err);

                            }
                            else {
                                Organization.getOrganization(function (err, organization) {
                                    if (err) {
                                        console.log(err);

                                    }
                                    else {
                                        db.close(connection, function (ret) {
                                            console.log("Inside getOrganization");
                                            var output = {
                                                responders: responders,
                                                chiefs: chiefs,
                                                vehicle: vehicle,
                                                organization: organization
                                            };
                                            res.setHeader('Content-Type', 'application/json');
                                            res.send(JSON.stringify(output));
                                        });
                                    }
                                });
                            }
                        })
                    }
                });
            });
        });
    }
};

exports.updateOrganization = function(req, res, next) {
  //see if user is logged in
  // if (!req.session.username || req.session.user.type % 10 != 1) {
  //     res.redirect(302, '/');
  // }
  // console.log("before if true");
  if(true) {
      var db = new Db();

      //start db connection
      db.start(function(connection){
        // console.log("req:=================");
        // console.log(req.body);
          //Get all responders
          Organization.updateOrganization(req,function(err, organizations){
              if(err) {

              }
              else {
                Vehicle.updateAllVehicleInfo(req,function(err, vehicles){
                  if(err){

                  }
                  else{
                    db.close(connection, function(ret){
                      var result = {
                          organizations: organizations,
                          vehicles: vehicles
                      };
                      // console.log("result:=================");
                      // console.log(result);
                      //TODO: response
                      res.setHeader('Content-Type', 'application/json');
                      res.send(JSON.stringify(result));
                    });
                  }//else
                });
              }//else
            });
          });
        }
};


// exports.updateOrganization = function(req, res, next) {
//   //see if user is logged in
//   // if (!req.session.username || req.session.user.type % 10 != 1) {
//   //     res.redirect(302, '/');
//   // }
//   // console.log("before if true");
//   if(true) {
//       var db = new Db();
//
//       //start db connection
//       db.start(function(connection){
//           //Get all responders
//           Organization.updateOrganization(req,function(err, result){
//               if(err) {
//
//               }
//               else {
//
//                   db.close(connection, function(ret){
//                       console.log("result:=================");
//                       console.log(result);
//                       //TODO: response
//                       res.send(JSON.stringify(result));
//                   });
//               }
//           });
//       });
//   }
// };

exports.viewOrganization = function(req, res, next) {
    //see if user is logged in
    // if (!req.session.username || req.session.user.type % 10 != 1) {
    //     res.redirect(302, '/');
    // }
    if (true) {
        var db = new Db();

        //start db connection
        Vehicle.getAllVehicleInfo().then((vehicle) => {
            db.start(function(connection) {
                //Get all chiefs
                User.getAllChiefs(function (err, chiefs) {
                    if (err) {

                    }
                    else {
                        Organization.getOrganization(function (err, organization) {
                            if (err) {

                            }
                            else {
                                db.close(connection, function (ret) {
                                    var output = {
                                        chiefs: chiefs,
                                        vehicle: vehicle,
                                        organization: organization
                                    };
                                    res.setHeader('Content-Type', 'application/json');
                                    res.send(JSON.stringify(output));
                                });
                            }
                        });
                    }
                });
            });
        });
    }
};

exports.loadOrganizationChart = function(req, res, next) {
    res.render('viewOrganizationChart', {
        username: req.session.user.username,
        user: req.session.user
    });
};

exports.loadAdministerOrganization = function(req, res, next) {
    res.render('administerOrganizationChart', {
        username: req.session.user.username,
        user: req.session.user
    });
}
