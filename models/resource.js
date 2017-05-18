"use strict";
var Promise = require('bluebird');
var join = Promise.join;
var User = Promise.promisifyAll(require("./user.js"));
var Vehicles = require("./vehicle.js");
var Area = Promise.promisifyAll(require("./patrolArea.js"));
var Incident = require("./incident.js");
var AllocatedResource = require("./allocatedResource.js");
var mongoose = require('../db/connect');

class Resource {
  constructor(vehicleId, allocatedByArea, allocatedId, allocatedVehicles) {
    this.vehicleId = vehicleId;
    this.allocatedByArea = allocatedByArea;
    this.allocatedId = allocatedId;
    this.allocatedVehicles = allocatedVehicles;
  }

  // class functions
  static getAllVehicles() {
    var fChiefs = User.getAllChiefsAsync();
    var fVehicles = Vehicles.getAllVehicleInfo();
    var fAllocatedResources = AllocatedResource.getAllAllocatedResources();

    return join(fChiefs, fVehicles, fAllocatedResources, function (chiefs, vehicles, allocatedResources) {
      var chief_type = {};
      for (i = 0; i < chiefs.length; i++) {
        chief_type[chiefs[i].username] = chiefs[i].type;
      }
      var vehicle_data = [];
      for (var i in vehicles) {
        var curVehicle = vehicles[i].toObject();
        var prefix = (chief_type[curVehicle.chiefName] || 4) === 4 ? 'Car' : 'Truck';
        for (var j = 1; j <= curVehicle.total; j++) {
          var allocated = false;
          for (var k = 0; k < allocatedResources.length; k++) {
            if (curVehicle._id.toString() === allocatedResources[k].vehicleOrPersonnelId.toString()
              && (j - 1) === allocatedResources[k].vehicleIndex) {
              allocated = true;
              break;
            }
          }
          if (!allocated) {
            var vehicle = {};
            vehicle.vehicleId = curVehicle._id;
            vehicle.idx = j - 1;
            vehicle.name = prefix + " " + j + " (" + curVehicle.chiefName + ")";
            vehicle_data.push(vehicle);
          }
        }
      }
      return vehicle_data;
    });
  }

  static getAllPersonnel() {
    var fPersonnel = User.getAllRespondersAsync();
    var fAllocatedResources = AllocatedResource.getAllAllocatedResources();
    return join(fPersonnel, fAllocatedResources, function(people, allocatedResources) {
        var people_data = [];
      for (var i in people) {
        var person = people[i];
        var allocated = false;
        for (var j = 0; j < allocatedResources.length; j++) {
          if (person._id.toString() === allocatedResources[j].vehicleOrPersonnelId.toString()) {
            allocated = true;
            break;
          }
        }
        if (!allocated) {
          people_data.push(person);
        }
      }
        return people_data;
    });
  }

  static getAllAreas() {
    var fAreas = new Promise(function (resolve, reject) {
      Area.getAllCoordinate(function (areas, err) {
        if (err) return reject(err);
        return resolve(areas);
      })
    });
    var fAllocatedResources = AllocatedResource.getAllAllocatedResources();
    return join(fAreas, fAllocatedResources, function(areas, allocatedResources) {
      for (var i in areas) {
        var area = areas[i];
        area.resources = [];
        for (var j = 0; j < allocatedResources.length; j++) {
          if (area._id.toString() === allocatedResources[j].areaOrIncidentId.toString()) {
            var resource = {};
            var resource_type = allocatedResources[j].isVehicle ? 'vehicle' : 'person'; // vehicle or person
            var resource_obj = {};
            if (allocatedResources[j].isVehicle) {
              resource_obj.vehicleId = allocatedResources[j].vehicleOrPersonnelId;
              resource_obj.name = allocatedResources[j].name;
              resource_obj.vehicleIndex = allocatedResources[j].vehicleIndex;
            } else {
              resource_obj._id = allocatedResources[j].vehicleOrPersonnelId;
              resource_obj.username = allocatedResources[j].name;
            }
            resource.resource_type = resource_type;
            resource.resource_obj = resource_obj;
            area.resources.push(resource);
          }
        }
        // area.resources = [{resource_type: "vehicle", resource_obj: {_id: 1, name: "Car 1"}}, {resource_type: "person", resource_obj: {_id: 2, username: "Jack"}}];
      }
      return areas;
    });
  }

  static getAllIncidents() {
    var fIncidents = Incident.getAllIncidents();
    var fAllocatedResources = AllocatedResource.getAllAllocatedResources();
    return join(fIncidents, fAllocatedResources, function(incidents, allocatedResources) {
      var incident_data = [];
      for (var i = 0; i < incidents.length; i++) {
        var curIncident = incidents[i];
        var incident = {};
        incident.incidentId = curIncident._id;
        incident.areaId = curIncident.areaId;
        incident.caller = curIncident.caller;
        incident.address = curIncident.address;
        incident.type = curIncident.type;
        incident.name = 'Incident ' + (i + 1) + ' at ' + curIncident.address;
        incident.resources = [];
        for (var j = 0; j < allocatedResources.length; j++) {
          if (incident.incidentId.toString() === allocatedResources[j].areaOrIncidentId.toString()) {
            var resource = {};
            var resource_type = allocatedResources[j].isVehicle ? 'vehicle' : 'person'; // vehicle or person
            var resource_obj = {};
            if (allocatedResources[j].isVehicle) {
              resource_obj.vehicleId = allocatedResources[j].vehicleOrPersonnelId;
              resource_obj.name = allocatedResources[j].name;
              resource_obj.vehicleIndex = allocatedResources[j].vehicleIndex;
            } else {
              resource_obj._id = allocatedResources[j].vehicleOrPersonnelId;
              resource_obj.username = allocatedResources[j].name;
            }
            resource.resource_type = resource_type;
            resource.resource_obj = resource_obj;
            incident.resources.push(resource);
          }
        }
        incident_data.push(incident);
      }
      return incident_data;
    });
  }

  static linkIncidentAndArea() {
    var fIncidents = Incident.getAllIncidents();
    var fAreas = this.getAllAreas();
    return join(fIncidents, fAreas, function(incidents, areas) {
      for (var i = 0; i < incidents.length; i++) {
        var curIncident = incidents[i];
        if (!curIncident.areaId) {
          var areaId = areas[Math.floor(Math.random() * areas.length)]._id;
          Incident.updateIncidentAreaId(curIncident._id, areaId).then(data => {
            console.log('updateIncidentAreaId');
          });
        }
      }
    });
  }

  static getAllocatedResources() {
    AllocatedResource.getAllAllocatedResources().then(resources => {
      console.log(resources);
    });
  }
}
module.exports = Resource;

