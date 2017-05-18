'use strict';

var Promise = require("bluebird");

var mongoose = require('../db/connect.js');
var vehicle = require('../db/schema/vehicle.js');
var VehicleModel = mongoose.model('Vehicle', vehicle.vehicleSchema);
//for ESN-110 - Police Car Allocation at Login
var vehicleAllocation = require('../db/schema/vehicleAllocation.js');
var VehicleAllocationModel = mongoose.model('VehicleAllocation', vehicle.vehicleAllocationSchema);

class Vehicle {
    constructor() {

    }

    static getAllVehicleInfo() {
        return VehicleModel.find({});
    }

    static updateAllVehicleInfo(data, callback) {
      // console.log(data.body);
      VehicleModel.remove({}, function(err, removeResult){
        if(err){

        }
        else{
          VehicleModel.insertMany(data.body.vehicle, function(err, insertResult) {
            if(err){

            }
            else{
              // console.log(insertResult);
              var results = {
                  removeResult: removeResult,
                  insertResult: insertResult
              };
              callback(err, results);
            }
          });
        }
      });
    }

    static getAllVehicleAllocationInfo() {
        return VehicleAllocationModel.find({}).sort({ vehicleID: 1 });
    }

    static getVehicleAllocationInfoByOfficerName(officerName){
        var res = VehicleAllocationModel.find({'allocatedOfficers': {$in: [officerName]} }).sort({ vehicleID: 1 });
        return res;
    }

    static getVehicleAllocationInfoByVehicleType(vehicleType){
        return VehicleAllocationModel.find({'vehicleType': vehicleType}).sort({ vehicleID: 1 });
    }

    static deleteOfficer(officerName){
        return VehicleAllocationModel.update( {}, {$pull: { allocatedOfficers: officerName }}, { multi: true } );
    }

    static addOfficerToVehicle(vehicleID, officerName){
         return VehicleAllocationModel.update({vehicleID: vehicleID }, {$push: { allocatedOfficers : officerName }}, { multi: true });
    }

    static findAll() {
        return VehicleAllocationModel.find({});
    }

    static addNewVehicles(vehiclesArray) {

        var vehicleInfo = vehiclesArray.pop();
        var vehicle = new VehicleAllocationModel();
        vehicle.vehicleID = vehicleInfo.vehicleID;
        vehicle.vehicleType = vehicleInfo.vehicleType;
        vehicle.allocatedOfficers = vehicleInfo.allocatedOfficers;
        var that = this;
        vehicle.save(function (err) {
            if (err) {
                return console.log(err);
            }
            else {
                if (vehiclesArray.length > 0) that.addNewVehicles(vehiclesArray);
                return;
            }
        });

    }

}

module.exports = Vehicle;
