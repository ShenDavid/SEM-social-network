var Db = require('../db/db');
var Hospital = require('../models/hospital');


// GET /hospital/getHospitalByName/:name
exports.getHospitalByName = function(req, res) {
	var db = new Db();
	var hospitalModel = new Hospital();
	var name = req.params.name;

	db.start(function(connection){
		hospitalModel.getHospitalByName(name, function(err, hospital){
			if (err) {
				db.close(connection, function(ret){
					res.sendStatus(500);
					console.log('db error when getting hospital by name');
				});
			}
			else {
				db.close(connection, function(ret){
					res.status(200).send(hospital);
					console.log('get hospital by name succussfully');
				});
			}
		});
	});
};

// GET /hospital/getAllHospitals
exports.getAllHospitals = function(req, res) {
	var db = new Db();
	var hospitalModel = new Hospital();

	db.start(function(connection){
		hospitalModel.getAllHospitals(function(err, hospital_list){
			if (err) {
				db.close(connection, function(ret){
					res.sendStatus(500);
					console.log('db error when getting hospital by name');
				});
			}
			else {
				db.close(connection, function(ret){
					res.status(200).send(hospital_list);
					console.log('get hospital list succussfully');
				});
			}
		});
	});
};

// POST /hospital/addUpdateHospital
exports.addUpdateHospital = function(req, res) {
	var db = new Db();
	var hospitalModel = new Hospital();
	var rb = req.body;
  console.log(rb);
	db.start(function(connection){
		hospitalModel.getHospitalByName(rb.name, function(err, hospital){
			if (err) {
				db.close(connection, function(ret){
					res.sendStatus(500);
					console.log('db error when getting hospital by name');
				});
			}
			else if (!hospital) {
				hospitalModel.addHospital(rb, function(err, newHospital){
					db.close(connection, function(ret){
						if (err) {
							res.sendStatus(500);
							console.log('hospital does not exist, failed to add hospital');
						}
						else {
							res.sendStatus(201);
							console.log('add hospital succussfully');
						}
					});
				});
			}
			else {
				hospitalModel.updateHospital(rb, function(err){
					db.close(connection, function(ret){
						if (err) {
							res.sendStatus(500);
							console.log('hospital already exists, failed to update');
						}
						else {
							res.sendStatus(201);
							console.log('update hospital succussfully');
						}
					});
				});
			}
		});
	});
};

// POST /hospital/deleteHospital
exports.deleteHospital = function(req, res) {
	var db = new Db();
	var hospitalModel = new Hospital();
	var rb = req.body;

	db.start(function(connection){
		hospitalModel.deleteHospital(rb, function(err){
			db.close(connection, function(ret){
				if (err) {
					res.sendStatus(500);
					console.log('failed to delete');
				}
				else {
					res.sendStatus(201);
					console.log('delete hospital succussfully');
				}
			});
		});
	});
};
