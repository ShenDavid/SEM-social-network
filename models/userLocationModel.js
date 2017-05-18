'use strict';

var userLocationDb = require('../db/interface/UserLocationDb');

class userLocationModel {
    constructor(){

    }

    static getUserLocation(username,callback){
        var locationDbInst = new userLocationDb();
        console.log("in model");
        locationDbInst.getLocation(username,function(err,locations){
            //if(err==false) callback()
            console.log(locations);
            callback(locations);
        });
    }

    static saveUserLocation(data, callback){
        var locationDbInst = new userLocationDb();
        locationDbInst.getLocation(data.username,function(exist,locations){
            if(exist==true){
                if(locations==null){
                    locationDbInst.addLocation(data,function(err,location){
                        if(err) callback(false);
                        else callback(true);
                    });
                }
                else{
                    locationDbInst.updateUserLocation(data.username, data.longitude,data.latitude,data.address,function(err){
                        if(err==false) callback(false);
                        else callback(true);
                    });
                }
            }
            else{
                callback(false);
            }
        });
    }
}

module.exports = userLocationModel;