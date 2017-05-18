'use strict';

var mongoose = require('mongoose');
var alert = require('../schema/alert.js');

var AlertModel = mongoose.model('Alert', alert.alertSchema);

class alertDb{
	constructor(){	
	}

	addAlert(data, callback){
    
    var alert = new AlertModel();
    alert.userName = data.userName;
    alert.groupName = data.groupName;
    alert.alertClass = data.alertClass;
    

    alert.save(function(err){
      console.log(err);
      callback(err, alert);
    });
  }


}

module.exports = alertDb;