'use strict';
var Promise = require('bluebird');
var hospitalDb = require('../db/interface/hospitalDb');

class Hospital {
    constructor() {
    }

    getHospitalByName(name, callback) {
    	var hospitalDbInst = new hospitalDb();
    	hospitalDbInst.getHospitalByName(name, function(err, hospital){
    		callback(err, hospital);
    	});
    }

    getAllHospitals(callback) {
    	var hospitalDbInst = new hospitalDb();

    	hospitalDbInst.getAllHospitals(function(err, hospital_list){
	      	callback(err, hospital_list);
	  	});
    }

    addHospital(hospitalInfo, callback) {
    	var hospitalDbInst = new hospitalDb();

    	hospitalDbInst.addHospital(hospitalInfo, function(err, newHospital){
    		callback(err, newHospital);
    	});
    }

    updateHospital(hospitalInfo, callback){
    	var hospitalDbInst = new hospitalDb();

    	hospitalDbInst.updateHospital(hospitalInfo, function(err){
    		callback(err);
    	});
    }

    deleteHospital(hospitalInfo, callback) {
    	var hospitalDbInst = new hospitalDb();

    	hospitalDbInst.deleteHospital(hospitalInfo.name, function(err) {
    		callback(err);
    	});
    }

	getBedsByName(name, callback) {
		var hospitalDbInst = new hospitalDb();
		hospitalDbInst.getBedsByName(name, function(err, hospital){
			callback(err, hospital);
		});
	}

	updateBedsAvailableByNurseName(name, beds, callback) {
        var hospitalDbInst = new hospitalDb();
        hospitalDbInst.updateBedsAvailableByNurseName(name, beds, function(err){
            callback(err);
        });
    }

	getHospitalByNurseName(username, callback) {
        var hospitalDBInst = new hospitalDb();
        console.log(username);
        hospitalDBInst.getHospitalByNurseName( username, function( err, hospital ){
            callback(err,hospital);
        });
    }


    static decrementNumberOfBeds( hospitalName, decrementNumber ){
		console.log( "decrementing beds of hospital " + hospitalName + " by " + decrementNumber);
		return hospitalDb.decrementNumberOfBeds( hospitalName, decrementNumber);
	}

}

module.exports = Hospital;
