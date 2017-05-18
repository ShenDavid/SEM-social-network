"use strict";

var Promise = require("bluebird");

var mongoose = require('../db/connect');
var incident = require('../db/schema/reach911');
var user = require('../db/schema/user.js');
var IncidentModel = mongoose.model('reach911', incident.reach911);
var UserModel = mongoose.model('User', user.userSchema);
var Patient = require('./patient.js');
var Group = require('./group.js');

class Incident {
    constructor(_id) {
        this._id = _id;
    }

    static getAllIncidents() {
        return IncidentModel.find({});
    }

    static getIncidentsFromDispatchPerspective(dispatcher) {
        return IncidentModel.find({
                $or: [{dispatcher: dispatcher}, {creator: dispatcher}]})
            .sort({date: 1});
    }

    static getAllIncidents() {
        return IncidentModel.find({});
    }

    static findById(id) {
        return IncidentModel.findById(id);
    }

    static removeAllIncidents() {
        return IncidentModel.remove({});
    }

    static generateIncidentId(incident_data) {
        var name = "";
        if (incident_data.caller !== undefined) {
            name = incident_data.caller;
        } else {
            name = incident_data.creator;
        }
        // append a random string to avoid conflict
        var today = new Date();
        return "I_" + name + `_${today.getMonth()+1}/${today.getDate()}/${today.getFullYear()}_${Math.random().toString(36).substr(2, 3)}`;
    }

    static generateCallerGroupName(incident_data) {
        // TODO: Refactor reach911 to use incident id
        return "IC_" + incident_data.caller;
    }

    static generateResponderGroupName(incident_data) {
        return incident_data.incidentId;
    }

    static generatePatientId(incident_data, i) {
        return incident_data.incidentId + `_P${i}`
    }

    static createIncident(incident_data) {
        if (incident_data.type === "Medical") {
            // create patient
            var incident;
            var patient_data = incident_data.patients;
            incident_data.patients = undefined;
            incident_data.patientlist = [];
            if (incident_data.incidentId === undefined)
                incident_data.incidentId = Incident.generateIncidentId(incident_data);

            return new Promise((resolve, reject) => {
                Promise.each(patient_data, (patient, i) => {
                    patient.incidentId = incident_data.incidentId;
                    patient.id = Incident.generatePatientId(incident_data, i);
                    if (patient.priority === undefined) {
                        if (incident_data.priority == "E")
                            patient.priority = 0;
                        else
                            patient.priority = parseInt(incident_data.priority);
                    }
                    patient.sex = (patient.sex === "Yes");
                    patient.conscious = (patient.conscious === "Yes");
                    patient.normalBreathing = (patient.normalBreathing === "Yes");

                    incident_data.patientlist.push(patient.id);
                    return Patient.createPatient(patient);
                }).then(() => {
                    return IncidentModel.create(incident_data);
                }).then((saved_data) => { resolve(saved_data); })
                    .catch(err => reject(err));
            });
        } else {
            return IncidentModel.create(incident_data);
        }
    }

    static getAvailableChiefs() {
        return new Promise(function(resolve, reject) {
            IncidentModel.find({
                state: "Assigned"
            }).distinct('commander').then((commanders) => {
                    return UserModel.find({
                            $or: [{'type' : 4 }, {'type' : 14 }, {'type' : 6 }, {'type' : 16 }],
                            username: {$nin: commanders}, // not assigned
                            onlineStatus: 0}) // online
                        .select('username type')
                        .sort({'username': 1});
                })
                .then((data) => resolve(data))
                .catch((err) => reject(err));
        });
    }

    static updateIncidentAreaId(incidentId, areaId) {
      return IncidentModel.findByIdAndUpdate(incidentId, {$set: {areaId: areaId}}, {new: true});
    }

    changeState(newState) {
        var set_options = {
            state: newState
        };
        if (newState == "Triage") {
            set_options.opening_datetime = Date.now();
        }
        else if (newState == "Closed") {
            set_options.closing_datetime = Date.now();
        }
        return IncidentModel.findByIdAndUpdate(
            this._id,
            {$set: set_options}
        );
    }

    transferCommand(commander) {
        var incident = this;
        var set_options = {
            commander: commander
        };
        return new Promise(function(resolve, reject) {
            incident.changeState("Assigned").then(() => {
                    return IncidentModel.findByIdAndUpdate(
                        incident._id,
                        {$set: set_options}
                    );
                })
                .then((data) => resolve(data))
                .catch((err) => reject(err));
        });
    }

    updateIncident(newData) {
        return IncidentModel.findByIdAndUpdate(
            this._id,
            {$set: newData}
        );
    }
}

module.exports = Incident;