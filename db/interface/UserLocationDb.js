'use strict';


var mongoose = require('mongoose');
var UserLocation = require('../schema/UserLocation.js');

var LocationModel = mongoose.model('UserLocation', UserLocation.UserLocation);

class UserLocationDb {
    constructor() {
    }

    addLocation(data, callback){
        var location = new LocationModel();
        location.username = data.username;
        location.latitude = data.latitude;
        location.longitude = data.longitude;
        location.address = data.address;
        location.save(function(err){
            callback(err, location);
        });
    }

    getLocation(username, callback){
        var getUserLocation = LocationModel.find({'username': username});
        getUserLocation.exec(function(err, rs){
            console.log(rs);
            if (err){
                callback(false, null);
            } else if (rs.length == 0){
                callback(true, null);
            } else {
                callback(true, rs);
            }
        });
    }

    updateUserLocation(username, new_longitude, new_latitude, new_addr,callback){
        var conditions = {username: username}
            , update = { $set: { latitude: new_latitude, longitude: new_longitude, address: new_addr}}
            , options = {multi: true};
        var query = LocationModel.update(conditions, update, options);
        query.exec(function(err, doc) {
            if (err) {
                callback(false);
            } else {
               // if (callback) {
                    callback(true);
               // }
            }
        });
    }

    deleteLocation(username, callback) {
        LocationModel.find({'username':username}).remove(function(err) {
            if (err) {
                callback(err);
            }
        });
    }

    //added by team kanban
    deleteLocationByUsername(username, callback) {
        LocationModel.find({'username':username}).remove(function(err) {
            if (err) {
                callback(false);
            }
            else{
              callback(true);
            }
        });
    }

}

module.exports = UserLocationDb;
