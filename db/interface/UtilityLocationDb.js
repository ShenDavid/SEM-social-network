'use strict';


var mongoose = require('mongoose');
var UtilityLocation = require('../schema/UtilityLocation.js');

var utilLocationModel = mongoose.model('UtilityLocation', UtilityLocation.UtilityLocation);

class UtilityLocationDb {
    constructor() {
    }

    addLocation(data, callback){
        var location = new utilLocationModel();
        location.utilityID = data.utilityID;
        location.latitude = data.latitude;
        location.longitude = data.longitude;
        location.address = data.address;
        location.category = data.category;
        location.save(function(err){
            callback(err, location);
        });
    }

    getLocation(utilityID, callback){
        var getUserLocation = utilLocationModel.find({'utilityID': utilityID});
        getUserLocation.exec(function(err, rs){
            if (err){
                callback(false, null);
            } else if (rs.length == 0){
                callback(true, null);
            } else {
                callback(true, rs);
            }
        });
    }

    getLocationByCategory(category, callback){
        var getUserLocationByCa = utilLocationModel.find({'category': category});
        getUserLocationByCa.exec(function(err, rs){
            if (err){
                callback(false, null);
            } else if (rs.length == 0){
                callback(true, null);
            } else {
                callback(true, rs);
            }
        });
    }

    updateUtilityLocation(utilityID, new_longitude, new_latitude, new_addr, callback){
        var conditions = {utilityID: utilityID}
            , update = { $set: { latitude: new_latitude, longitude: new_longitude, address: new_addr}}
            , options = {multi: true};
        var query = utilLocationModel.update(conditions, update, options);
        query.exec(function(err, doc) {
            if (err) {
                callback(err);
            } else {
                if (callback) {
                    callback();
                }
            }
        });
    }

    deleteLocation(utilityID, callback) {
        utilLocationModel.find({'utilityID':utilityID}).remove(function(err) {
            if (err) {
                callback(err);
            }
        });
    }
}

module.exports = UtilityLocationDb;
