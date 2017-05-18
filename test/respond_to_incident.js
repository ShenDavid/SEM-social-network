process.env.NODE_ENV = 'test';

var expect = require('expect.js');
var Promise = require('bluebird');
var Incident = require('../models/incident.js');
var Patient = require('../models/patient.js');
var incident1, incident2, incident3;

suite("Respond to Incident Tests", function() {
    suiteSetup(function(done) {
        done();
    });

    suiteTeardown(function(done) {
        Incident.removeAllIncidents()
            .then(() => {
                return Patient.deleteAllPatients();
            })
            .then(() => done())
            .catch((err) => done(err));
    });

    test("can create fire incident", function(done) {
        var fire_data = {
            caller: "Jack",
            address: "123 Cool Road",
            type: "Fire",

            smoke: "Heavy",
            smokecolor: "Black",
            flame: "High",
            injury: "Severe",
            structype: "Building",
            hmaterial: "No",
            insidePeople: "No",
            getout: "Yes"
        };

        Incident.createIncident(fire_data).then(incident_data => {
            incident1 = new Incident(incident_data._id);
            expect(incident_data.caller).to.be("Jack");
            done();
        }).catch(err => done(err));
    });

    test("can create police incident", function(done) {
        var police_data = {
            caller: "Paul",
            address: "124 Cool Road",
            type: "Fire",

            weapon: "Gun",
            injured: "Yes",
            suspect: "Tall, male",
            vehicle: "Truck",
            safe: "Yes",
            left: "No",
            detail: "Not available"
        };

        Incident.createIncident(police_data).then(incident_data => {
            incident2 = new Incident(incident_data._id);
            expect(incident_data.caller).to.be("Paul");
            done();
        }).catch(err => done(err));
    });

    test("can create medical incident", function(done) {
        var medical_data = {
            caller: "Ann",
            address: "126 Cool Road",
            type: "Medical",

            patients: [{
                name: "Patient 1",
                priority: 0,
                condition: 1
            },{
                name: "Patient 2",
                priority: 0,
                condition: 1
            }]
        };

        Incident.createIncident(medical_data).then(incident_data => {
            incident3 = new Incident(incident_data._id);
            patientIds = incident_data.patientlist;
            expect(incident_data.caller).to.be("Ann");
            expect(incident_data.patientlist.length).to.be(2);
            done();
        });
    });
});