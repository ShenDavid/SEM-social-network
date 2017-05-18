process.env.NODE_ENV = 'test';

var expect = require('expect.js');
var request = require("request");
var bluebird = require('bluebird');

var app = require("../app").app;
var login = require("./integration_login").login;
var logout = require("./integration_login").logout;

var	Db = require("../db/db");
var	Hospital = require("../models/hospital");
var	base_url = "http://localhost:8080/";

var hospitalModel = new Hospital();
var db = new Db();
var j = request.jar();

var hospital1 = {
	name: "H1",
	address: "A1",
	description: "D1",
	nurses: [],
	beds: -1
};

var newHospital1 = {
	name: "H1",
	address: "NA1",
	description: "ND1",
	nurses: ["N1", "N2"],
	beds: -1
};

suite("Integration Tests - Register Hospital", function() {
	this.timeout(3000);
    
    suiteSetup(function(done) {
        login("Ivor", "Shuang", j)
            .then(() => done())
            .catch(err => done(err));
    });

    suiteTeardown(function(done) {
        logout("Ivor")
        	.then(() => done())
            .catch(err => done(err));
    });

	test("Add Hospital", function(done){
		var options = {
			method: 'post',
			body: hospital1,
			json: true,
			url: base_url + "hospital/addUpdateHospital",
			jar: j
		};

		request(options, function(err, res, body){
			expect(err).to.be(null);
			expect(res.statusCode).to.be(201);
			done();
		});
	});

	test("Get Hospital By Name", function(done){
		request({url: base_url + "hospital/getHospitalByName/" + hospital1.name, jar: j}, function(err, res, body){
			var hospital = JSON.parse(body);

			expect(err).to.be(null);
			expect(res.statusCode).to.be(200);

			expect(hospital.name).to.be(hospital1.name);
			expect(hospital.address).to.be(hospital1.address);
			expect(hospital.description).to.be(hospital1.description);
			expect(hospital.nurses.length).to.be(0);
			done();
		});
	});

	test("Update Hospital", function(done){
		var options = {
			method: 'post',
			body: newHospital1,
			json: true,
			url: base_url + "hospital/addUpdateHospital",
			jar: j
		};

		request(options, function(err, res, body){
			expect(err).to.be(null);
			expect(res.statusCode).to.be(201);
			done();
		});
	});

	test("Get All Hospitals", function(done){
		request({url: base_url + "hospital/getAllHospitals", jar: j}, function(err, res, body){
			var hospital_list = JSON.parse(body);

			expect(err).to.be(null);
			expect(res.statusCode).to.be(200);

			expect(hospital_list.length).to.be(1);

			expect(hospital_list[0].name).to.be(newHospital1.name);
			expect(hospital_list[0].address).to.be(newHospital1.address);
			expect(hospital_list[0].description).to.be(newHospital1.description);
			expect(hospital_list[0].nurses.length).to.be(2);
			expect(hospital_list[0].nurses[0]).to.be("N1");
			expect(hospital_list[0].nurses[1]).to.be("N2");
			done();
		});
	});

	test("Delete Hospital", function(done){
		var options = {
			method: 'post',
			body: newHospital1,
			json: true,
			url: base_url + "hospital/deleteHospital",
			jar: j
		};

		request(options, function(err, res, body){
			expect(err).to.be(null);
			expect(res.statusCode).to.be(201);
			done();
		});
	});
});
