'use strict';

var config = require('../config.js');
var userDb = require('../db/interface/userDb');
var organizationDb = require('../db/interface/organizationDb');

var mongoose = require('../db/connect');
var organization = require('../db/schema/organization');
var organizationModel = mongoose.model('Organization', organization.organizationSchema);

class Organization {
    constructor() {

    }

    //for manage_inventory integration test usage
    static addOrganization(organization) {
      var newOrg = new organizationModel(organization);
      return newOrg.save();
    }

    //for manage_inventory integration test usage
    static deleteOrganization(id){
      return organizationModel.findOneAndRemove({"_id": id}).exec();
    }

    static getOrganization(callback) {
        var organizationDbInst = new organizationDb();

        organizationDbInst.getOrganization(function(err, results) {
            callback(err, results);
        });
    }


    static updateOrganization(req, callback) {
        console.log("fsfsfafa");
        var organizationDbInst = new organizationDb();

        organizationDbInst.updateOrganization(req, function(err, results) {
            callback(err, results);
        });
    }

    static getChiefName(username){
      return organizationModel.find({"responderName": username});
    }
}

module.exports = Organization;
