'use strict';

var mongoose = require('mongoose');
var organization = require('../schema/organization.js');
var user = require('../schema/user.js');

var OrganizationModel = mongoose.model('Organization', organization.organizationSchema);
var UserModel = mongoose.model('User', user.userSchema);

class organizationDb {
    constructor() {

    }

    getAllResponders(callback) {
        UserModel.find({ $or: [{'type' : 5 }, {'type' : 15 }, {'type' : 7 }, {'type' : 17 }, {'type' : 8}, {'type' : 18}]})
            .select('username type')
            .sort({'username': 1})
            .exec(function(err, responders){
            callback(err, responders);
        });
    }

    getAllChiefs(callback) {
        UserModel.find({ $or: [{'type' : 4 }, {'type' : 14 }, {'type' : 6 }, {'type' : 16 }]})
            .select('username type')
            .sort({'username': 1})
            .exec(function(err, chiefs){
                callback(err, chiefs);
            });
    }

    getOrganization(callback) {
        OrganizationModel.find({})
            .exec(function(err, results) {
                callback(err, results);
            });
    }

    getRespondersByChief(chiefName, callback) {
        OrganizationModel.find({'chiefName': chiefName})
            .select('responderName')
            .sort({'responderName': 1})
            .exec(function(err, responders){
                callback(err, responders);
            });
    }

    // addRespondersToChief(data, callback) {
    //     var organization = new OrganizationModel();
    //     organization.responderName = data.responderName;
    //     organization.chiefName = data.chiefName;
    //     organization.organizationType = data.organizationType;
    //
    //     organization.save(function(err){
    //         callback(err, organization);
    //     });
    // }
    //
    // deleteRespondersFromChief(responderName, callback) {
    //     OrganizationModel.find({'responderName': responderName})
    //         .remove(function(err) {
    //             callback(err);
    //         });
    // }
    //
    // deleteChiefFromOrganization(chiefName, callback) {
    //     OrganizationModel.find({'chiefName': chiefName})
    //         .remove(function(err) {
    //             callback(err);
    //         });
    // }

    updateOrganization(data, callback) {
      // console.log(data.body);
      OrganizationModel.remove({}, function(err, removeResult){
        if(err){

        }
        else{
          OrganizationModel.insertMany(data.body.organization, function(err, insertResult) {
            if(err){

            }
            else{
              console.log(err);
              // console.log(insertResult);
              var results = {
                  removeResult: removeResult,
                  insertResult: insertResult
              };
              callback(err, results);
            }
          });
        }
      });
    }

    // updateOrganization(data, callback) {
    //   console.log(data.body);
    //   var toDelete = data.body[0];
    //   var keywordsArray = [];
    //   for(var i = 0; i < toDelete.length; i++){
    //     keywordsArray.push(toDelete[i].responderName);
    //   }
    //   OrganizationModel.remove({ responderName: { $in: keywordsArray }}, function(err, removeResult){
    //     if(err){
    //
    //     }
    //     else{
    //       OrganizationModel.insertMany(data.body[1], function(err, insertResult) {
    //         if(err){
    //
    //         }
    //         else{
    //           console.log("123213o12u310");
    //           console.log(err);
    //           console.log(insertResult);
    //           var results = {
    //               removeResult: removeResult,
    //               insertResult: insertResult
    //           };
    //           callback(err, results);
    //         }
    //       });
    //     }
    //   });
    // }

}

module.exports = organizationDb;
