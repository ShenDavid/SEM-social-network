var Db = require('../db/db');
var User = require('../models/user');
var Organization = require('../models/organization');
var Vehicle = require('../models/vehicle');
var userDb = require('../db/interface/userDb');
var Message = require('../models/message');
var MessageDb = require('../db/interface/messageDb');
var config = require('../config');
var Group = require('../models/group');


exports.getAllVehicleAllocationInfo = function(req, res, next) {
        Vehicle.getAllVehicleAllocationInfo().then((vehicleAllocation) => {
            var result = {
                vehicleAllocation: vehicleAllocation
            };
            //TODO: response
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(result));
        });
};

exports.getMatchingVehicleAllocationInfo = function(req, res, next) {
        var officerName = req.session.username;
        var userType = req.session.user.type;

        var vehicleType = 0;
        if (userType % 10 === 4 || userType % 10 === 5) {
            vehicleType = 0;
        }
        if (userType % 10 === 6 || userType % 10 === 7 || userType % 10 === 8) {
            vehicleType = 1;
        }
        Vehicle.getVehicleAllocationInfoByOfficerName(officerName).then((vehicleAllocation1) => {
          Vehicle.getVehicleAllocationInfoByVehicleType(vehicleType).then((vehicleAllocation2) => {
            var result = {
                vehiclesByName: vehicleAllocation1,
                vehiclesByType: vehicleAllocation2
            };
            //TODO: response
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(result));
        });
      });
};

// exports.getVehicleAllocationInfoByVehicleType = function(req, res, next) {
//         Vehicle.getVehicleAllocationInfoByVehicleType(req.params.vehicleType).then((vehicleAllocation) => {
//             var result = {
//                 vehicleAllocation: vehicleAllocation
//             };
//             //TODO: response
//             res.setHeader('Content-Type', 'application/json');
//             res.send(JSON.stringify(result));
//         });
// };

exports.updateVehicleAllocationInfo = function(req, res, next) {
        var officerName = req.session.username;
        Vehicle.deleteOfficer(officerName).then((vehicleAllocation1) => {
            if(req.body.currVehicle != 'None'){
              Vehicle.addOfficerToVehicle(req.body.currVehicle, officerName).then((vehicleAllocation2) => {
                  res.status(200).send();
              }).catch(err => {
                  console.log("111" + err);
                  res.status(500).send(err);
              });
            }
            else{
              res.status(200).send();
            }
        }).catch(err => {
            res.status(500).send(err);
        });
};

exports.initializeVehicle = function() {
    Vehicle.findAll().then(result => {

        if (result.length == 0) {
            var vehicleArray = [];
            for (var i = 0; i < 10; i ++) {
                var vehicleID = 'Car#' + i;
                var vehicleInfo = {
                    vehicleID: vehicleID,
                    vehicleType: 0,
                    allocatedOfficers: []
                };
                vehicleArray.push(vehicleInfo);
            }
            for (var i = 0; i < 10; i ++) {
                var vehicleID = 'Truck#' + i;
                var vehicleInfo = {
                    vehicleID: vehicleID,
                    vehicleType: 1,
                    allocatedOfficers: []
                };
                vehicleArray.push(vehicleInfo);
            }
            Vehicle.addNewVehicles(vehicleArray);
        }
    });
};


// exports.loadOrganizationChart = function(req, res, next) {
//     res.render('viewOrganizationChart', {
//         username: req.session.user.username,
//         user: req.session.user
//     });
// };
//
// exports.loadAdministerOrganization = function(req, res, next) {
//     res.render('administerOrganizationChart', {
//         username: req.session.user.username,
//         user: req.session.user
//     });
// };
