'use strict';

var Db = require('../db/db');
var statusDb = require('../db/interface/statusDb');

class Status {
  constructor(username, statusCode){

    this.username = username;
    if(statusCode===0)this.status="OK";
    if(statusCode==1)this.status="Help";
    if(statusCode==2)this.status="Emergency";

    this.statusCode = statusCode;

  }

  saveStatus(callback) {
    var statusDbInst = new statusDb();
    var status = this;
    statusDbInst.addStatus(status, function(err, statusData){
      callback(err, statusData);
    });
  }

  static getStatusCrumbs(username, callback){
    var statusDbInst = new statusDb();
    statusDbInst.getStatusCrumbs(username, function(err, crumbs){
      if(err){
        callback(err, 200, null);
      } else {
        crumbs.sort(function(a,b){
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        callback(err, 200, crumbs);
      }
    });
  }

  static updateStatusCrumbsWithNewUsername(old_username, new_username, callback){
    var statusDbInst = new statusDb();
    statusDbInst.updateStatusCrumbUsername(old_username, new_username, function(err){
      callback(err);
    });
  }

}

module.exports = Status;
