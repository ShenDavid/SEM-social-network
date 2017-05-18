/**
 * Created by LinSun on 17/4/7.
 */
"use strict";

var Promise = require("bluebird");
var join = Promise.join;
var Resource = require('../models/resource');
var AllocatedResource = require("../models/allocatedResource.js");

exports.allocateResource = function(req, res) {
    //see if user is logged in
    if (!req.session.username){
        res.redirect(302, '/');
        return;
    }

    // link incident and area here
    Resource.linkIncidentAndArea().then(() => {
        var fVehicle = Resource.getAllVehicles();
        var fPersonnel = Resource.getAllPersonnel();
        var fAreas = Resource.getAllAreas();
        var fIncidents = Resource.getAllIncidents();
        join(fVehicle, fPersonnel, fAreas, fIncidents, function (vehicles, personnel, areas, incidents) {
            res.render('allocateResource', {
                user: req.session.user,
                username: req.session.username,
                vehicles: vehicles,
                personnel: personnel,
                areas: areas,
                incidents: incidents
            });
        });
    });
};

/***** APIs *****/
exports.allocateVehicleOrPersonnel = function(req,res, next){
  var jsonString = req.body.data;
  var commands = JSON.parse(jsonString);
  for (var i = 0; i < commands.length; i++) {
    var command = commands[i];
    var resource_type = command.resource_type; // vehicle or person
    var resource_obj = command.resource_obj;
    var allocated_to_type = command.allocated_to_type; // area or incident
    var allocated_to_obj = command.allocated_to_obj;

    var isVehicle = resource_type === 'vehicle';
    var isArea = allocated_to_type === 'area';
    var vehicleOrPersonnelId = isVehicle ? resource_obj.vehicleId : resource_obj._id;
    var areaOrIncidentId = isArea ? allocated_to_obj._id : allocated_to_obj.incidentId;
    var vehicleIndex = resource_obj.idx;
    var name = isVehicle ? resource_obj.name : resource_obj.username;

    var allocatedResource = new AllocatedResource(vehicleOrPersonnelId, areaOrIncidentId,
      isVehicle, isArea, vehicleIndex, name);
    console.log(allocatedResource);
    allocatedResource.createResource()
  }

  res.send('success');
};

exports.unallocateVehicleOrPersonnel = function(req,res, next){
  var jsonString = req.body.data;
  var command = JSON.parse(jsonString);
  console.log(command);
  var resource_type = command.resource_type;
  var resource_obj = command.resource_obj;
  var isVehicle = resource_type === 'vehicle';
  var vehicleOrPersonnelId = isVehicle ? resource_obj.vehicleId : resource_obj._id;
  var vehicleIndex = isVehicle ? resource_obj.vehicleIndex : 0;
  AllocatedResource.deleteResource(vehicleOrPersonnelId, isVehicle, vehicleIndex);
  res.send('success');
};