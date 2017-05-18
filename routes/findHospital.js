/**
 * Created by rajkiran on 4/7/17.
 */
var Promise = require('bluebird');
var Patient = require('../models/patient');
var config = require('../config');
var Hospital = require('../models/hospital');


exports.renderFindHospitalPage = function(req, res) {
    var hospitalModel = new Hospital();
    Patient.getUnAssignedPatients().then( patients_list => {
            hospitalModel.getAllHospitals(function(err, hospital_list){
                if (!err) {
                    hospitals = [];
                    for (var hospital_index = 0; hospital_index < hospital_list.length; hospital_index++) {
                        var hospital = {
                            hospital_name: hospital_list[hospital_index].name,
                            beds: hospital_list[hospital_index].beds
                        };
                        hospitals.push(hospital);
                    }
                    var patients = [];
                    for( var patient_index = 0; patient_index < patients_list.length; patient_index++ ){
                        var patient = {
                            patient_name : patients_list[patient_index].name,
                            patient_id : patients_list[patient_index].id
                        };
                        patients.push( patient );
                    }
                    res.render('findHospital', {
                        username: req.session.user.username,
                        user: req.session.user,
                        patient_list: patients,
                        requiresBottomNav: true,
                        hospitals_list: hospitals
                    });
                    console.log('get hospital list succussfully');
                } else {
                    res.sendStatus(500);
                    console.log('db error when getting hospital by name');
                }
            });
    }).catch(err => res.status(500).send(err));
};

// POST hospital updated patients information
exports.saveHospitalInformation = function( req, res ) {

    //res.status(200).send( null);

    var hospital_patients = req.body ;
    console.log( hospital_patients );
    var hospital = hospital_patients;

    var hospital_name = hospital.hospital.hospital_name;
    console.log( "hospital_name " + hospital_name);
    var patient_id = hospital.patient.patient_id;
    console.log( "patient id " + patient_id);

    Hospital.decrementNumberOfBeds(hospital_name, 1 ).then( () => {
        Patient.assignPatientToHospital( hospital_name, patient_id ).then( () => {
            res.status(200).send(null);
        });
    }).catch( err => {
        res.status(500).send(err);
    });

};


//FOLLOWING FUNCTIONS ONLY FOR DEMOING
//WILL BE DELETED ON ACCEPTANCE OF THE EPICS RELATING TO PATIENTS

exports.testInsertPatients = function (req, res, next) {
    console.log( "trying to setup patients for demo ");

    Patient.getAllPatients().then( patients_list => {
        if( patients_list.length != 0 ){
            for( var patient_index = 0; patient_index < patients_list.length; patient_index++ ){
                Patient.makePatientsBedLess( patients_list[patient_index].id );
            }
        }
        else {
            console.log( "No existing patients to setup ");
            var newPatient = {
                id: "test",
                incidentId: 999,
                hospitalName: null,
                hasBed: false,
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
            };

            var r = res;
            console.log("Inserting test patient: " + newPatient);
            Patient.createPatient(newPatient).then(data => {
                var returnedPatient = data;
                console.log("Added Test Patient: " + returnedPatient);
                r.status(200).send(newPatient);
            }).catch(err => r.status(500).send(err));
        }
    }).catch(err => res.status(500).send("failed to retrieve all the patients"));

};


