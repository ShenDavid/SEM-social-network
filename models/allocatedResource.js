"use strict";
var Promise = require('bluebird');

var mongoose = require('../db/connect');
var allocatedResource = require('../db/schema/allocatedResource.js');

var allocatedResourceModel = mongoose.model('AllocatedResource', allocatedResource.allocatedResourceSchema);

class AllocatedResource {
  constructor(vehicleOrPersonnelId, areaOrIncidentId, isVehicle, isArea, vehicleIndex, name) {
    this.vehicleOrPersonnelId = vehicleOrPersonnelId;
    this.areaOrIncidentId = areaOrIncidentId;
    this.isVehicle = isVehicle;
    this.isArea = isArea;
    this.vehicleIndex = vehicleIndex;
    this.name = name;
  }
  // class functions
  static getAllAllocatedResources() {
    return allocatedResourceModel.find();
  }

  static deleteResource(vehicleOrPersonnelId, isVehicle, vehicleIndex) {
    return new Promise(function (resolve, reject) {
      if (isVehicle) {
        allocatedResourceModel.remove({
          'vehicleOrPersonnelId': vehicleOrPersonnelId,
          'vehicleIndex': vehicleIndex
        }).then(() => resolve())
          .catch(err => reject(err))
      } else {
        allocatedResourceModel.remove({'vehicleOrPersonnelId': vehicleOrPersonnelId}).then(() => resolve())
          .catch(err => reject(err))
      }
    });
  }

  // member functions
  createResource() {
    var resource = new allocatedResourceModel();
    resource.vehicleOrPersonnelId = this.vehicleOrPersonnelId;
    resource.areaOrIncidentId = this.areaOrIncidentId;
    resource.isVehicle = this.isVehicle;
    resource.isArea = this.isArea;
    resource.vehicleIndex = this.vehicleIndex;
    resource.name = this.name;

    return new Promise(function (resolve, reject) {
      resource.save().then(createdResource => resolve(createdResource))
        .catch(err => reject(err));
    });
  }


}
module.exports = AllocatedResource;

