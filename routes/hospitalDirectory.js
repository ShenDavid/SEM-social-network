var Db = require('../db/db');
var Hospital = require('../models/hospital');

exports.renderHospitalDirectory = function(req, res, next){
	var db = new Db();
	var hospitalModel = new Hospital();
	var hospitals = [];

	db.start(function(connection){
		hospitalModel.getAllHospitals(function(err, hospital_list){
			if (!err) {
				db.close(connection, function(ret){
					for (var i = 0; i < hospital_list.length; i++) {
						hospitals.push(hospital_list[i]);
					}
					
					res.render('hospitalDirectory', {
						username: req.session.username,
						user: req.session.user,
						hospitals: hospitals
				  	});
				});
			}
		});
	});
};