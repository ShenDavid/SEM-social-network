'use strict';

var utilityLocationDb = require('../db/interface/UtilityLocationDb');

class utilityLocationModel {
    constructor(){

    }

    static insertHospitalPreProcessData(callback){
        var locationDbInst = new utilityLocationDb();
        var data={};
        data.utilityID = "1";
        data.latitude = "37.376636";
        data.longitude = "-122.064529";
        data.address = "Palo Alto Medical Foundation: Sutter Health Affiliate";
        data.category = "hospital";
        locationDbInst.addLocation(data,function(err,location){
            if(err) callback(false);
            else callback(true);
        });
        data.utilityID = "2";
        data.latitude = "37.369942";
        data.longitude = "-122.081447";
        data.address = "Womens Hospital at El Camino Hospital";
        data.category = "hospital";
        locationDbInst.addLocation(data,function(err,location){
            if(err) callback(false);
            else callback(true);
        });
        data.utilityID = "3";
        data.latitude = "37.366681";
        data.longitude = "-122.078042";
        data.address = "Silicon Valley Primary Care";
        data.category = "hospital";
        locationDbInst.addLocation(data,function(err,location){
            if(err) callback(false);
            else callback(true);
        });
        data.utilityID = "4";
        data.latitude = "37.395644";
        data.longitude = "-122.104384";
        data.address = "Palo Alto Medical Foundation";
        data.category = "hospital";
        locationDbInst.addLocation(data,function(err,location){
            if(err) callback(false);
            else callback(true);
        });
        data.utilityID = "5";
        data.latitude = "37.368604";
        data.longitude = "-122.082209";
        data.address = "Hospital Drive Surgery Center";
        data.category = "hospital";
        locationDbInst.addLocation(data,function(err,location){
            if(err) callback(false);
            else callback(true);
        });
    }

    static insertCarsPreProcessData(callback){
        var locationDbInst = new utilityLocationDb();
        var data={};
        data.utilityID = "6";
        data.latitude = "37.410515";
        data.longitude = "-122.060247";
        data.address = "S Akon Rd";
        data.category = "car";
        locationDbInst.addLocation(data,function(err,location){
            if(err) callback(false);
            else callback(true);
        });
        data.utilityID = "7";
        data.latitude = "37.410549";
        data.longitude = "-122.061276";
        data.address = "Bushnell Rd";
        data.category = "car";
        locationDbInst.addLocation(data,function(err,location){
            if(err) callback(false);
            else callback(true);
        });
        data.utilityID = "8";
        data.latitude = "37.409714";
        data.longitude = "-122.059828";
        data.address = "485-487 Wescoat Rd";
        data.category = "car";
        locationDbInst.addLocation(data,function(err,location){
            if(err) callback(false);
            else callback(true);
        });
        data.utilityID = "9";
        data.latitude = "37.411529";
        data.longitude = "-122.059313";
        data.address = "N Akron Rd";
        data.category = "car";
        locationDbInst.addLocation(data,function(err,location){
            if(err) callback(false);
            else callback(true);
        });
        data.utilityID = "10";
        data.latitude = "37.411572";
        data.longitude = "-122.058348";
        data.address = "San Francisco Peninsula";
        data.category = "car";
        locationDbInst.addLocation(data,function(err,location){
            if(err) callback(false);
            else callback(true);
        });
    }
    static insertIncidentsPreProcessData(callback){
        var locationDbInst = new utilityLocationDb();
        var data={};
        data.utilityID = "11";
        data.latitude = "37.410328";
        data.longitude = "-122.059627";
        data.address = "San Francisco Peninsula";
        data.category = "incident";
        locationDbInst.addLocation(data,function(err,location){
            if(err) callback(false);
            else callback(true);
        });
        data.utilityID = "12";
        data.latitude = "37.410328";
        data.longitude = "-122.059997";
        data.address = "San Francisco Peninsula";
        data.category = "incident";
        locationDbInst.addLocation(data,function(err,location){
            if(err) callback(false);
            else callback(true);
        });
        data.utilityID = "13";
        data.latitude = "37.410502";
        data.longitude = "-122.058699";
        data.address = "20S Akon Rd";
        data.category = "incident";
        locationDbInst.addLocation(data,function(err,location){
            if(err) callback(false);
            else callback(true);
        });
        data.utilityID = "14";
        data.latitude = "37.410877";
        data.longitude = "-122.059080";
        data.address = "S Akron Rd";
        data.category = "incident";
        locationDbInst.addLocation(data,function(err,location){
            if(err) callback(false);
            else callback(true);
        });
        data.utilityID = "15";
        data.latitude = "37.410012";
        data.longitude = "-122.059638";
        data.address = "485-487 Wescoat Rd";
        data.category = "incident";
        locationDbInst.addLocation(data,function(err,location){
            if(err) callback(false);
            else callback(true);
        });
    }
    static insertTrucksPreProcessData(callback){
        var locationDbInst = new utilityLocationDb();
        var data={};
        data.utilityID = "16";
        data.latitude = "37.410106";
        data.longitude = "-122.060485";
        data.address = "489-499 Wescoat Rd";
        data.category = "truck";
        locationDbInst.addLocation(data,function(err,location){
            if(err) callback(false);
            else callback(true);
        });
        data.utilityID = "17";
        data.latitude = "37.411223";
        data.longitude = "-122.060196";
        data.address = "N Akon Rd";
        data.category = "truck";
        locationDbInst.addLocation(data,function(err,location){
            if(err) callback(false);
            else callback(true);
        });
        data.utilityID = "18";
        data.latitude = "37.411205";
        data.longitude = "-122.059176";
        data.address = "San Francisco Peninsula";
        data.category = "truck";
        locationDbInst.addLocation(data,function(err,location){
            if(err) callback(false);
            else callback(true);
        });
        data.utilityID = "19";
        data.latitude = "37.410311";
        data.longitude = "-122.062178";
        data.address = "26 Clark Rd";
        data.category = "truck";
        locationDbInst.addLocation(data,function(err,location){
            if(err) callback(false);
            else callback(true);
        });
        data.utilityID = "20";
        data.latitude = "37.409723";
        data.longitude = "-122.057747";
        data.address = "483 Wescoat Rd";
        data.category = "truck";
        locationDbInst.addLocation(data,function(err,location){
            if(err) callback(false);
            else callback(true);
        });
    }
    static getUtilityLocation(utilityID,callback){
        var locationDbInst = new utilityLocationDb();
        locationDbInst.getLocation(utilityID,function(err,locations){
            callback(locations);
        });
    }

    static getLocationByCategory(category, callback){
        var locationDbInst = new utilityLocationDb();
        locationDbInst.getLocationByCategory(category,function(err,locations){
            callback(locations);
        });
    }

    static saveUtilityLocation(data, callback){
        var locationDbInst = new utilityLocationDb();
        locationDbInst.getLocation(data.utilityID,function(exist,locations){
            if(exist==true){
                if(locations==null){
                    locationDbInst.addLocation(data,function(err,location){
                        if(err) callback(false);
                        else callback(true);
                    });
                }
                else{
                    locationDbInst.updateUtilityLocation(data.utilityID, data.longitude,data.latitude,data.address,function(err){
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

module.exports = utilityLocationModel;
