'use strict';

var mongoose = require('mongoose');
var hospital = require('../schema/hospital.js');

var HospitalModel = mongoose.model('Hospital', hospital.hospitalSchema);

class hospitalDb {
	constructor(){
	}

	getHospitalByName(name, callback){
		HospitalModel.findOne({'name': name}, function(err, hospital){
			callback(err, hospital);
		});
	}

	getAllHospitals(callback){
		HospitalModel.find({}, function(err, hospital_list){
			callback(err, hospital_list);
		});
	}

	addHospital(data, callback){
		var hospital = new HospitalModel();
		hospital.name = data.name;
		hospital.address = data.address;
		hospital.description = data.description;
		hospital.nurses = data.nurses;
		hospital.save(function(err){
			callback(err, hospital);
		});
	}

  	updateHospital(data, callback){
  		HospitalModel.findOne({name: data.name}, function(err, doc){
        	doc.address = data.address;
        	doc.description = data.description;
        	doc.nurses = data.nurses;

        	doc.save(function(err, record, numAffect){
        		callback(err);
        	});
    	});
  	}

	deleteHospital(name, callback){
		HospitalModel.find({'name': name}).remove(function(err){
			callback(err);
		});
	}

	updateBedsAvailableByNurseName( name, number, callback ){
        HospitalModel.findOne({ nurses : { "$in" : [name] } }, function(err, hospital){
            hospital.beds = number;
            hospital.save(function(err, record, numAffect){
                callback(err);
            });
        });
	}

	getBedsByName( name, callback ){
		this.getHospitalByName( name, function(hospital){
			callback( hospital.beds );
		});
	}

    getHospitalByNurseName(nursename, callback) {
        HospitalModel.findOne( { nurses: { "$in" : [nursename]} }, function( err, hospital ){
            callback(err, hospital);
        });
    }

    static  decrementNumberOfBeds( hospitalName, decrementNumber ){
        return HospitalModel.findOne({ name : hospitalName }, function( err, hospital ){
			console.log( hospitalName );
			console.log( hospital );
            console.log(decrementNumber);
			hospital.beds = hospital.beds - decrementNumber;
            hospital.save();
		});
	}
}

module.exports = hospitalDb;
