process.env.NODE_ENV = 'test';

var expect = require('expect.js');
var request = require('request-promise');
var bluebird = require('bluebird');

var app = require("../app").app;
var Patient = require("../models/patient");

var Db = require("../db/db");
var User = require("../models/user");
var Hospital = require("../models/hospital");

var newNurse = {
  username: "testNurse",
  password: "12345",
  type: 9
};

var newParamedic = {
  username: "testParamedic",
  password: "12345",
  type: 8,
  incidentList: ["456"]
};

var newHospital = {
  name: "Test Hospital",
  address: "Test St.",
  description: "A hospital to test treatments only.",
  nurses: [newNurse.username, "randomNurse"]
};

var newPatient = new Patient({
  id: "test",
  incidentId: newParamedic.incidentList[0],
  hospitalName: newHospital.name,
  hasBed: true,
  priority: 0,
  location: 1,
  name: "flea",
  dateOfBirth: new Date(),
  age: 25,
  sex: true,
  conscious: true,
  normalBreathing: false,
  complaint: "CLOUD CLOUD CLOUD",
  condition: 5,
  drugs: "meth",
  allergies: "none"
});

var db = new Db();
var userModel = new User();
var hospitalModel = new Hospital();

function createPatient(patientName, patientPriority) {
   var newPatient = {
      id: patientName+"ID",
      incidentId: "456",
      hospitalName: "El Camino Hospital",
      hasBed: true,
      priority: patientPriority,
      location: 0,
      name: patientName,
      dateOfBirth: new Date(),
      age: 25,
      sex: false,
      conscious: true,
      normalBreathing: false,
      complaint: "Chest pain",
      condition: 6,
      drugs: "Antibiotics",
      allergies: "None"
   };
   return newPatient;
}

function checkIfExists(obj) {
  expect(undefined).to.not.be(obj);
  expect(null).to.not.be(obj);
}

suite("Patients", function(){
  this.timeout(2000);

  suiteSetup(function(done) {

    db.start(function(connection){
      userModel.addUser(newNurse, function(err, nurse){
        expect(err).to.be(null);
        expect(nurse.username).to.be("testNurse");
        userModel.addUser(newParamedic, function(err, paramedic){
          expect(err).to.be(null);
          expect(paramedic.username).to.be("testParamedic");
          hospitalModel.addHospital(newHospital, function(err){
            db.close(connection, function(ret){
              done();
            });
          })
        })
      });
    });

  });

  suiteTeardown(function(done) {
    db.start(function(connection){
      userModel.deleteUser(newNurse, function(err) {
        expect(err).to.be(null);
        userModel.deleteUser(newParamedic, function(err){
          expect(err).to.be(null);
          hospitalModel.deleteHospital(newHospital, function(err){
            expect(err).to.be(null);
            db.close(connection, function(err) {
              done();
            });
          });
        });
      });
    });
  });

   test("Initial Get All Patients (Empty)", function(done) {
      Patient.getAllPatients()
      .then(patients => {
         expect(patients.length).to.be(0);
         done();
      })
      .catch(error => {
         console.log(error);
      });
   });

   test("Create One New Patient", function(done){
      var patient1Name = "testPatient1";
      var patient1Priority = 3;
      var patient1 = createPatient(patient1Name, patient1Priority);
      Patient.createPatient(patient1)
      .then(createdPatient => {
         checkIfExists(patient1);
         expect(patient1Name).to.be(createdPatient.name);
         expect(patient1Priority).to.be(createdPatient.priority);
      })
      .then(() => Patient.deletePatient(patient1.id))
      .then(() => done())
      .catch(error => {
         console.log(error);
         Patient.deletePatient(patient1.id);
      });
   });

   test("Create Multiple New Patients", function(done) {
      var patient1Name = "testPatient1";
      var patient1Priority = 3;
      var patient1 = createPatient(patient1Name, patient1Priority);

      var patient2Name = "testPatient2";
      var patient2Priority = 0;
      var patient2 = createPatient(patient2Name, patient2Priority);

      Patient.createPatient(patient1)
      .then(() => Patient.createPatient(patient2))
      .then(() => Patient.getAllPatients())
      .then(createdPatients => {
         checkIfExists(createdPatients);
         expect(2).to.be(createdPatients.length);
         expect(patient1.name).to.be(createdPatients[0].name);
         expect(patient2.name).to.be(createdPatients[1].name);
      })
      .then(() => {
         Patient.deletePatient(patient1.id);
         Patient.deletePatient(patient2.id);
         done();
      })
      .catch(error => {
         console.log(error);
         Patient.deletePatient(patient1.id);
         Patient.deletePatient(patient2.id);
      });
   });

  test("Update Existing Patient", function(done) {
      var patient1Name = "testPatient1";
      var patient1Priority = 3;
      var patient1 = createPatient(patient1Name, patient1Priority);

      var newComplaint = "New complaint";
      var newPriority = 1;

      Patient.createPatient(patient1)
      .then(() => {
         patient1.complaint = newComplaint;
         patient1.priority = newPriority;
      })
      .then(() => Patient.updatePatient(patient1))
      .then(() => Patient.getPatientById(patient1.id))
      .then(updatedPatient => {
         checkIfExists(updatedPatient);
         expect(newComplaint).to.be(updatedPatient.complaint);
         expect(newPriority).to.be(updatedPatient.priority);
      })
      .then(() => Patient.deletePatient(patient1.id))
      .then(() => done())
      .catch(error => {
         console.log(error);
         Patient.deletePatient(patient1.id);
      });
  });

  test("Delete Existing Patient", function(done) {
      var patient1Name = "testPatient1";
      var patient1Priority = 3;
      var patient1 = createPatient(patient1Name, patient1Priority);

      Patient.createPatient(patient1)
      .then(() => Patient.getAllPatients())
      .then(currentPatients => {
         checkIfExists(currentPatients);
         expect(1).to.be(currentPatients.length);
      })
      .then(() => Patient.deletePatient(patient1.id))
      .then(() => Patient.getAllPatients())
      .then(deletedPatientsList => {
         checkIfExists(deletedPatientsList);
         expect(0).to.be(deletedPatientsList.length);
         done();
      })
      .catch(error => {
         console.log(error);
         Patient.deletePatient(patient1.id);
      });
  });

  test("Get Hospital Nurse works at", function(done){
    Patient.getHospital(newNurse.username, function(hospital){
      checkIfExists(hospital);
      expect(hospital.name).to.be(newHospital.name);
      expect(hospital.address).to.be(newHospital.address);
      expect(hospital.description).to.be(newHospital.description);
      expect(hospital.nurses[0]).to.be(newHospital.nurses[0]);
      expect(hospital.nurses[1]).to.be(newHospital.nurses[1]);
      done();
    });
  })

  test("Get Patients by Nurse's hospital", function(done){
    Patient.createPatient(newPatient)
    .then(() => Patient.getPatientsByHospital(newHospital.name))
    .then(sorted_patients => {
      checkIfExists(sorted_patients);
      expect(sorted_patients[0].length).to.be(0);
      expect(sorted_patients[1].length).to.be(0);
      expect(sorted_patients[2].length).to.be(1);
    })
    .then(() => Patient.deletePatient(newPatient.id))
    .then(() => done())
    .catch(error => {
      console.log(error);
      Patient.deletePatient(newPatient.id);
    });
  });

  test("Get Patients by Paramedic's list of incidents", function(done){
    Patient.createPatient(newPatient)
    .then(() => Patient.getPatientsByIncident(newParamedic.incidentList))
    .then(sorted_patients => {
      checkIfExists(sorted_patients);
      expect(sorted_patients[0].length).to.be(0);
      expect(sorted_patients[1].length).to.be(1);
      expect(sorted_patients[2].length).to.be(0);
    })
    .then(() => Patient.deletePatient(newPatient.id))
    .then(() => done())
    .catch(error => {
      console.log(error);
      Patient.deletePatient(newPatient.id);
    });
  });

});
