process.env.NODE_ENV = 'test';

var expect = require('expect.js'),
	Db = require("../db/db"),
	Hospital = require("../models/hospital"),
	hospitalModel = new Hospital();

var db = new Db();
//use conn to hold the connection
var conn;

var hospital1 = {
	name: "H1",
	address: "A1",
	description: "D1",
	nurses: [],
	beds: -1
};

var hospital2 = {
	name: "H2",
	address: "A2",
	description: "D2",
	nurses: ["N1", "N2"],
	beds: -1
};

suite("Register Hospital", function() {

	suiteSetup(function(done) {
		db.start(function(connection){
			conn = connection;
			hospitalModel.addHospital(hospital1, function(err, addedHospital1){
				expect(err).to.be(null);
				expect(addedHospital1.name).to.be("H1");
				hospitalModel.addHospital(hospital2, function(err, addedHospital2){
					expect(err).to.be(null);
					expect(addedHospital2.name).to.be("H2");
					done();
				});
			});
		});
	});

	suiteTeardown(function(done) {
		hospitalModel.deleteHospital(hospital1, function(err){
			expect(err).to.be(null);
			hospitalModel.deleteHospital(hospital2, function(err){
				expect(err).to.be(null);
				db.close(conn, function(err) {
					done();
				});
			});
		});
	});

	test("Add Hospital Successfully", function(done){
		hospitalModel.getHospitalByName(hospital1.name, function(err, hospital){
			expect(err).to.be(null);
			expect(hospital.address).to.be(hospital1.address);
			expect(hospital.description).to.be(hospital1.description);
			expect(hospital.nurses.length).to.be(0);
		});

		hospitalModel.getHospitalByName(hospital2.name, function(err, hospital){
			expect(err).to.be(null);
			expect(hospital.address).to.be(hospital2.address);
			expect(hospital.description).to.be(hospital2.description);
			expect(hospital.nurses.length).to.be(2);
			expect(hospital.nurses[0]).to.be("N1");
			expect(hospital.nurses[1]).to.be("N2");
			done();
		});
	});

	test("Get All Hospitals", function(done){
		hospitalModel.getAllHospitals(function(err, hospital_list){
			expect(err).to.be(null);
			expect(hospital_list.length).to.be(2);

			expect(hospital_list[0].name).to.be(hospital1.name);
			expect(hospital_list[0].address).to.be(hospital1.address);
			expect(hospital_list[0].description).to.be(hospital1.description);
			expect(hospital_list[0].nurses.length).to.be(0);

			expect(hospital_list[1].name).to.be(hospital2.name);
			expect(hospital_list[1].address).to.be(hospital2.address);
			expect(hospital_list[1].description).to.be(hospital2.description);
			expect(hospital_list[1].nurses.length).to.be(2);
			expect(hospital_list[1].nurses[0]).to.be("N1");
			expect(hospital_list[1].nurses[1]).to.be("N2");
			done();
		});
	});

	test("Update Hospital", function(done) {
		var newHospital1 = hospital1;
		newHospital1.address = "NH1";
		newHospital1.description = "ND1";
		newHospital1.nurses = ["N1"];

		hospitalModel.updateHospital(newHospital1, function(err){
			expect(err).to.be(null);

			hospitalModel.getHospitalByName(newHospital1.name, function(err, hospital){
				expect(err).to.be(null);
				expect(hospital.address).to.be(newHospital1.address);
				expect(hospital.description).to.be(newHospital1.description);
				expect(hospital.nurses.length).to.be(1);
				expect(hospital.nurses[0]).to.be("N1");
				done();
			});
		});
	});
});