'use strict';

var Promise = require('bluebird');

var mongoose = require('mongoose');
var patient = require('../db/schema/patient');

var patientModel = mongoose.model('Patient', patient.patientSchema);

//OBSOLETE, required due to hospital routes/models not using promise style
var Db = require('../db/db');
var Hospital = require('../models/hospital');

class Patient {
  constructor(data) {
    this.id = data.id;
    this.incidentId = data.incidentId;
    this.hospitalName = data.hospitalName;
    this.hasBed = data.hasBed;
    this.priority = data.priority;
    this.location = data.location;
    this.name = data.name;
    this.dateOfBirth = data.dateOfBirth;
    this.age = data.age;
    this.sex = data.sex;
    this.conscious = data.conscious;
    this.normalBreathing = data.normalBreathing;
    this.complaint = data.complaint;
    this.condition = data.condition;
    this.drugs = data.drugs;
    this.allergies = data.allergies;
  }

  //class functions
  static getAllPatients(){
    return patientModel.find();
  }

  static getPatientById(id) {
    return patientModel.findOne({"id": id});
  }

  static getHospital(nurseUsername, callback){
    var db = new Db();
    var hospitalModel = new Hospital();

    //hospital routes/models have not
    //refactored to promise style yet
    db.start(function(connection){
      hospitalModel.getHospitalByNurseName(nurseUsername, function(err, hospital){
        db.close(connection, function(ret){
          if(err){
            callback(null);
          } else {
            callback(hospital);
          }
        });
      });
    });
  }

  static getPatientsByHospital(hospitalName) {
    return new Promise(function(resolve, reject) {
      patientModel.find({"hospitalName": hospitalName})
      .then(patient_list => {
        var sorted_patients, i, p;
        var requested = [];
        var ready = [];
        var occupied = [];
        for(i = 0; i < patient_list.length; i++){
          p = patient_list[i];
          if(p.priority === 0 || p.priority == 1){
            if(p.location === 0 && !p.hasBed)
              requested.push(p);
            else if(p.location === 0 && p.hasBed)
              ready.push(p);
            else if(p.location == 1 && p.hasBed)
              occupied.push(p);
          }
        }
        sorted_patients = [requested, ready, occupied];
        return sorted_patients;
      })
      .then(sorted_patients => resolve(sorted_patients))
      .catch(err => reject(err));
    });
  }

  static getPatientsByIncident(incidentList) {
    return new Promise(function(resolve,reject){
      patientModel.find({"incidentId" : { $in: incidentList } })
      .then(patient_list => {
        var sorted_patients, i, p;
        var toER = [];
        var atER = [];
        var other = [];
        for(i = 0; i < patient_list.length; i++){
          p = patient_list[i];
          if(p.priority === 0 || p.priority == 1){
            if(p.location === 0)
              toER.push(p);
            else
              atER.push(p);
          } else {
            other.push(p);
          }
        }
        sorted_patients = [toER, atER, other];
        return sorted_patients;
      })
      .then(sorted_patients => resolve(sorted_patients))
      .catch(err => reject(err));
    });
  }

  static getUnAssignedPatients() {
    return patientModel.find( {"hasBed" : false});
  }

  static makePatientsBedLess(patientId) {
    return patientModel.findOne( {"id" : patientId}, function( err, patient ){
      console.log( patient );
      patient.hasBed = false;
      patient.save();
    });
  }

  static assignPatientToHospital( hospitalName, patientId ){
      return patientModel.findOne( {"id" : patientId}, function( err, patient ){
          console.log( patient );
          patient.hospitalId = hospitalName;
          patient.hasBed = true;
          patient.save();
      });
  }

  //member functions
  //has to take in either an incidentId or hospitalId to create
  //createPatient(/*hospitalId or incidentId*/){
  static createPatient(patient) {
      var newPatient = new patientModel(patient);
      return newPatient.save();
  }

  //update a patient by id
  static updatePatient(patient){
    return patientModel.updateOne({"id":patient.id}, patient).exec();
  }

  //delete a patient by id
  static deletePatient(id){
    return patientModel.findOneAndRemove({"id": id}).exec();
  }

  // delete all patients
  static deleteAllPatients() {
    return patientModel.remove({});
  }

}

module.exports = Patient;
