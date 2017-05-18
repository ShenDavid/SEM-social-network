"use strict";

var Incident = require("../models/incident.js");
var Group = require("../models/group.js");
var Patient = require("../models/patient.js");
var Promise = require("bluebird");
var qs = require("qs");

exports.getIncidents = function(req, res) {
    //see if user is logged in
    if (!req.session.username){
        res.redirect(302, '/');
        return;
    }

    var user = req.session.user;
    if (user.type % 10 == 3) {
        // dispatch
        Incident.getIncidentsFromDispatchPerspective(user.username).then((incidents) => {
            var incident_data = [
                {"title": "Waiting", "records": []},
                {"title": "Triage", "records": []},
                {"title": "Assigned", "records": []},
                {"title": "Closed", "records": []}
            ];

            for (var i in incidents) {
                var incident = incidents[i];
                if (incident.state === "Waiting") {
                    incident_data[0]["records"].push(incident);
                }
                else if (incident.state === "Triage") {
                    incident_data[1]["records"].push(incident);
                }
                else if (incident.state === "Assigned") {
                    incident_data[2]["records"].push(incident);
                }
                else if (incident.state === "Closed") {
                    incident_data[3]["records"].push(incident);
                }
                else {
                    incident_data[0]["records"].push(incident);
                }
            }

            res.render('incidents', {
                user: user,
                username: user.username,
                incident_categories: incident_data,
                nav_title: "Incidents"
            });
        })
            .catch((err) => {res.status(500).send(err)});
    } else if (user.type % 10 == 4 ||
        user.type % 10 == 5 ||
        user.type % 10 == 6 ||
        user.type % 10 == 7 ||
        user.type % 10 == 8) {
        // police: 4, 5
        // fire: 6, 7
        // paramedic: 8

        Incident.getAllIncidents().then((incidents) => {
            var incident_data = [{
                "title": "My Incident",
                "records": {
                    "E": [],"1": [],"2": [],"3": []
                }
            },{
                "title": "Other Open Incidents",
                "records": {
                    "E": [],"1": [],"2": [],"3": []
                }
            },{
                "title": "Closed Incidents",
                "records": []
            }];

            for (var i in incidents) {
                var incident = incidents[i];
                var priority = incident.priority;
                if (priority === undefined) {
                    incident.priority = "E";
                    priority = "E";
                }
                if ("state" in incident && incident.state === "Closed") {
                    incident_data[2]["records"].push(incident);
                } else if ("commander" in incident && incident.commander === user.username) {
                    incident_data[0]["records"][priority].push(incident);
                } else {
                    incident_data[1]["records"][priority].push(incident);
                }
            }

            for (var i = 0; i <= 1; i++) {
                var records = [];
                ["E", "1", "2", "3"].forEach(p => {
                    records = records.concat(incident_data[i]["records"][p]);
                });
                incident_data[i]["records"] = records;
            }

            res.render('incidents', {
                user: user,
                username: user.username,
                incident_categories: incident_data,
                nav_title: "Incidents"
            });
        })
            .catch((err) => {res.status(500).send(err)});
    }
};

exports.newOrShowIncident = function(req, res) {
    //see if user is logged in
    if (!req.session.username){
        res.redirect(302, '/');
        return;
    }

    var user = req.session.user;
    var id = req.params.incidentId;
    if (id === undefined || id === "") {
        var incident_data = {
            creator: user.username
        };
        incident_data.incidentId = Incident.generateIncidentId(incident_data);
        res.render('incident', {
            user: user,
            username: user.username,
            incident: incident_data,
            availableChiefs: {},
            nav_title: "Incident"
        });
    } else {
        var incident = {};
        Incident.findById(id).then((data) => {
            if (data.state == "Waiting") {
                // first time to open the incident
                var incidentObj = new Incident(data._id);
                return incidentObj.changeState("Triage");
            } else
                return Promise.resolve(data);
        }).then((data) => {
            if (data.type === "Medical") {
                return new Promise((resolve, reject) => {
                    data.patients = [];
                    Promise.each(data.patientlist, function(patientId) {
                        Patient.getPatientById(patientId).then((patient) => {
                            data.patients.push(patient);
                        });
                    })
                        .then(() => { resolve(data); })
                        .catch((err) => { reject(err); });
                });
            } else {
                return Promise.resolve(data);
            }
        }).then((data) => {
            incident = data;
            if (incident.commander === undefined) {
                // set default commander to dispatcher
                incident.commander = incident.dispatcher;
            }

            if (user.username === incident.commander) {
                return Incident.getAvailableChiefs();
            } else {
                return Promise.resolve([]);
            }
        }).then((availableChiefs) => {
            res.render('incident', {
                user: user,
                username: user.username,
                incident: incident,
                availableChiefs: availableChiefs,
                nav_title: "Incident"
            });
        })
            .catch((err) => {res.status(500).send(err)});
    }
};

exports.createOrUpdateIncident = function(req, res) {
    //see if user is logged in
    if (!req.session.username){
        res.status(401).send("Plese login to perform this action");
        return;
    }
    var incident_data = qs.parse(req.body);
    
    var incidentId = req.body._id;
    if (incidentId === undefined || incidentId === "") {
        Incident.createIncident(incident_data)
            .then((data) => {res.status(200).send(data)})
            .catch((err) => {res.status(500).send(err)});
    } else {
        var incident = new Incident(incidentId);
        incident.updateIncident(req.body)
            .then((data) => {res.status(200).send(data)})
            .catch((err) => {res.status(500).send(err)});
    }
};

exports.changeStatus = function(req, res) {
    //see if user is logged in
    if (!req.session.username){
        res.status(401).send("Plese login to perform this action");
        return;
    }

    var incidentId = req.params.incidentId;
    var newState = req.body.newState;
    var incident = new Incident(incidentId);
    incident.changeState(newState)
        .then((data) => {res.status(200).send(data)})
        .catch((err) => {res.status(500).send(err)});
};

exports.transferCommand = function(req, res) {
    //see if user is logged in
    if (!req.session.username){
        res.status(401).send("Plese login to perform this action");
        return;
    }

    var incidentId = req.params.incidentId;
    var commander = req.body.commander;
    var incident = new Incident(incidentId);
    incident.transferCommand(commander)
        .then((data) => {res.status(200).send(data)})
        .catch((err) => {res.status(500).send(err)});
};