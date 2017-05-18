'use strict';

var AlertDb = require('../db/interface/alertDb');

class Alert{
	constructor(userName, groupName, alertClass){
		this.userName = userName;
		this.groupName = groupName;
		this.alertClass = alertClass;
	}

	saveAlert(callback) {
    var alertDbInst = new AlertDb();
    var alrt = this;
    
    alertDbInst.addAlert(alrt, function(err, alertData){
      if(err)
        callback(500, null);
      else
        callback(201, alertData);
    });
  }
}

module.exports = Alert;