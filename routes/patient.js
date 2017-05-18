"use strict";

var Promise = require('bluebird');
var Patient = require('../models/patient');
var config = require('../config');

//Legacy code does not use promises
var Db = require('../db/db');
var User = require('../models/user');
var Hospital = require('../models/hospital');

/* Retrieve patients */
/* patients retrieved is based on the user type/role*/
exports.getPatients = function(req, res, next) {

  var user = req.session.user;

  //see if user is logged in
  //also see if user is a nurse or paramedic, redirect otherwise
  if (!req.session.username || (user.type != 8 && user.type != 9)){
    res.redirect(302, '/');
  } else {

    //return data based on type of user request
    //if userType is paramedic == 8
    if (user.type == 8){
      Patient.getPatientsByIncident(user.incidentList).then(data => {
        res.render('patientDirectory', {
          username: req.session.username,
          user: user,
          nav_title: "Patients",
          patient_list: data
        });
      }).catch(err => {
          console.log("Error retrieving patient: " + err);
          res.status(500).send(err);
      });
    }
    //if userType is nurse == 9
    else if (user.type == 9){
      var hospital;
      //hospital name isn't set inside the user when they register to a hospital
      //workaround is to get the hospital name of the nurse each time they
      //access this page
      if(!user.hospitalId){
        hospital = Patient.getHospital(user.username, function(hospital){
          //if the nurse is registered to a hospital
          if(hospital){
            //hospital db grabs nurse's hospital by nurse username
            Patient.getPatientsByHospital(hospital.name).then(data => {
              res.render('patientDirectory', {
                username: req.session.username,
                user: user,
                nav_title: "Patients",
                patient_list: data
              });
            }).catch(err => {
                console.log("Error retrieving patient: " + err);
                res.status(500).send(err);
            });
          } else {
            res.render('patientDirectory', {
              username: req.session.username,
              user: user,
              nav_title: "Patients",
              patient_list: null
            });
          }
        });
      }
    }
  }
};

/* Retrieve 1 patient's profile */
exports.getPatientProfile = function(req, res, next) {
  var user = req.session.user;

  //see if user is logged in
  //also see if user is a nurse or paramedic, redirect otherwise
  if (!req.session.username){
    res.redirect(302, '/');
  } else {
    //var db = new Db();

    //var patientModel = new Patient();

    Patient.getPatientById(req.params.id).then(data => {
      var patient = data;

      if(patient === null) {
          res.status(404).send(null);
      }
      else {
          patient.dateOfBirthString = patient.dateOfBirth.toISOString().substring(0,10);
          res.render("patientProfile", {
              username: req.session.username,
              user: user,
              nav_title: "Patient",
              requiresBottomNav: true,
              patient: patient
          });
      }
    }).catch(err => res.status(500).send(err));

  }
};

exports.postPatientProfile = function (req, res, next) {
    var user = req.session.user;
    if (!req.session.username){
        res.redirect(302, '/');
    } else {
        var updatedPatient = req.body;
        Patient.getPatientById(req.params.id).then(patient => {
            console.log("Updated Patient = " + JSON.stringify(updatedPatient));
            if(patient !== null) {
               return Patient.updatePatient(updatedPatient);
            }
            else {
               return Promise.reject("Patient not found");
            }
        })
        .then(() => res.status(200).send(updatedPatient))
        .catch(err => {
            console.log("Error retrieving patient: " + err);
            res.status(500).send(err);
        });
    }
};

exports.deletePatientProfile = function(req, res, next) {
   var user = req.session.user;
   if (!req.session.username || (user.type !== 8 && user.type !== 9)){
      res.redirect(302, '/');
   } else {
      var patientId = req.params.id;
      console.log("Deleting Patient with ID " + patientId);
      Patient.deletePatient(patientId)
      .then(() => res.status(200).send(null))
      .catch(err => {
         console.log("Error deleting patient: " + err);
         res.status(500).send(err);
      });
   }
};
