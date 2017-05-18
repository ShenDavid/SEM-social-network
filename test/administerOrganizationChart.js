process.env.NODE_ENV = 'test';

var expect = require('expect.js');
var request = require("request-promise");
var bluebird = require('bluebird');

var app = require("../app").app;
var createNewUser = require("./integration_login").createNewUser;
var login = require("./integration_login").login;
var logout = require("./integration_login").logout;
var base_url = "http://localhost:8080/";

var j = request.jar();

var Db = require("../db/db");
var db = new Db();
var userDb = require('../db/interface/userDb');
var User = require("../models/user");
var userModel = new User();
var Organization = require("../models/organization");
var organizationDb = require('../db/interface/organizationDb');
var OrganizationModel = new Organization();
var organizationDbInst = new organizationDb();
var mongoose = require('mongoose');
var organization = require('../db/schema/organization.js');
var OrganizationSchema = mongoose.model('Organization', organization.organizationSchema);
var Vehicle = require("../models/vehicle");
var vehicle = require('../db/schema/vehicle.js');
var VehicleAllocationModel = mongoose.model('VehicleAllocation', vehicle.vehicleAllocationSchema);

var newUser1, newUser2, newUser3, newUser4, newUser5;
var conn;

var org = new OrganizationSchema();
var org2 = new OrganizationSchema();

function createNewUser2(name, tp) {
	var newUser = {
		username: name,
    password: "1234",
    status: 0,
		type: tp
	};
	return newUser;
}

suite("Integration Test for Administer Organization Chart", function() {
    this.timeout(3000);

    suiteSetup(function (done) {
      newUser2 = createNewUser2("TestUserPoliceChief", 4);
      newUser3 = createNewUser2("TestUserPatrolOfficer", 5);
      newUser4 = createNewUser2("TestUserFireChief", 6);
      newUser5 = createNewUser2("TestUserFirefighter", 7);

      org.responderName = newUser3.username;
      org.chiefName = newUser2.username;
      org.organizationType = 0;

      org2.responderName = newUser5.username;
      org2.chiefName = newUser4.username;
      org2.organizationType = 1;

			var vehicle1 = new VehicleAllocationModel();
			vehicle1.vehicleID = "TestCar#0";
			vehicle1.vehicleType = 0;
			vehicle1.allocatedOfficers = ["TestOfficerJohn"];
			var vehicle2 = new VehicleAllocationModel();
			vehicle2.vehicleID = "TestTruck#0";
			vehicle2.vehicleType = 1;
			vehicle2.allocatedOfficers = ["TestOfficerJohn"];

      db.start(function(connection){
  			conn = connection;
        userModel.addUser(newUser2, function(err, addedUser){
          expect(err).to.be.undefined;
          userModel.addUser(newUser3, function(err, addedUser){
            expect(err).to.be.undefined;
            userModel.addUser(newUser4, function(err, addedUser){
              expect(err).to.be.undefined;
              userModel.addUser(newUser5, function(err, addedUser){
                org.save(function(err){
                    org2.save(function(err){
											vehicle1.save(function (err) {
												vehicle2.save(function (err) {

		                      expect(err).to.be.undefined;
		                        createNewUser("TestUser12", "pass1", 0, 1).then(() => {
		                            return login("TestUser12", "pass1", j, false);
		                        })
		                        .then(() => done())
		                        .catch(err => done(err));
		                        // done();
												});
                    });
                  });
								});
              });
            });
          });
        });
      });
    });

    suiteTeardown(function (done) {
        userModel.deleteUser(newUser2, function(err){
				expect(err).to.be.undefined;
				userModel.deleteUser(newUser3, function(err){
				expect(err).to.be.undefined;
        userModel.deleteUser(newUser4, function(err){
				expect(err).to.be.undefined;
				userModel.deleteUser(newUser5, function(err){
				expect(err).to.be.undefined;
				VehicleAllocationModel.find({'vehicleID': 'TestCar#0'}).remove(function(err){
				VehicleAllocationModel.find({'vehicleID': 'TestTruck#0'}).remove(function(err){

					db.close(conn, function(err) {
            logout("TestUser12").then(() => done());
				});
				});
				});
        });
        });
			});
			});
    });


    test("Access Administer Organization Directory", function(done) {
        var options = {
            uri: base_url + "organization",
            method: 'GET',
            jar: j,
            resolveWithFullResponse: true
        };

        request(options)
            .then(res => {
                expect(res.statusCode).to.be(200);
                done();
            })
            .catch(err => done(err));
    });

    test("Get All Responders (user.js)", function(done) {
      User.getAllResponders(function(err,responders){
        expect(err).to.be.undefined;
        expect(responders[0].username).to.be("TestUserFirefighter");
        expect(responders[1].username).to.be("TestUserPatrolOfficer");
        done();
      });
    });

    test("Get All Chiefs (user.js)", function(done) {
  		User.getAllChiefs(function(err,chiefs){
  			expect(err).to.be.undefined;
  			expect(chiefs[0].username).to.be("TestUserFireChief");
        expect(chiefs[1].username).to.be("TestUserPoliceChief");
  			done();
  		});
  	});

    test("Get All Responders (organizationDb.js)", function(done) {
      organizationDbInst.getAllResponders(function(err,responders){
        expect(err).to.be.undefined;
        expect(responders[0].username).to.be("TestUserFirefighter");
        expect(responders[1].username).to.be("TestUserPatrolOfficer");
        done();
      });
    });

    test("Get All Chiefs (organizationDb.js)", function(done) {
  		organizationDbInst.getAllChiefs(function(err,chiefs){
  			expect(err).to.be.undefined;
  			expect(chiefs[0].username).to.be("TestUserFireChief");
        expect(chiefs[1].username).to.be("TestUserPoliceChief");
  			done();
  		});
  	});

    test("Get Organization (organizationDb.js)", function(done) {
      organizationDbInst.getOrganization(function(err,results){
        expect(err).to.be.undefined;
        expect(results[0].chiefName).to.be("TestUserPoliceChief");
        expect(results[0].responderName).to.be("TestUserPatrolOfficer");
        expect(results[1].chiefName).to.be("TestUserFireChief");
        expect(results[1].responderName).to.be("TestUserFirefighter");
        done();
      });
    });

    test("Get Responders By Chief (organizationDb.js)", function(done) {
      organizationDbInst.getRespondersByChief(org.chiefName, function(err,responders){
        expect(err).to.be.undefined;
        expect(responders[0].responderName).to.be(org.responderName);
        done();
      });
    });

    test("Get Organization (models/organization.js)", function(done) {
      Organization.getOrganization(function(err,results){
        expect(err).to.be.undefined;
        expect(results[0].chiefName).to.be("TestUserPoliceChief");
        expect(results[0].responderName).to.be("TestUserPatrolOfficer");
        expect(results[1].chiefName).to.be("TestUserFireChief");
        expect(results[1].responderName).to.be("TestUserFirefighter");
        done();
      });
    });

    // test("Update Organization", function(done) {
    //
    //   payload = {"responderName": "TestUserPatrolOfficer", "chiefName": "TestUserPoliceChief","organizationType":"1"};
    //
    //   Organization.updateOrganization(payload, function(err, result){
    //       expect(err).to.be.undefined;
    //       done();
    //   });
    // });


		test("Test getAllVehicleAllocationInfo RESTful API", function(done) {
				var options = {
						uri: base_url + "vehicleAllocation",
						method: 'GET',
						jar: j,
						resolveWithFullResponse: true
				};

				request(options)
						.then(res => {
								expect(res.statusCode).to.be(200);
								done();
						})
						.catch(err => done(err));
		});


		test("Test getMatchingVehicleAllocationInfo RESTful API", function(done){
				var form = {
						"officerName": "policeChief",
						"userType": 4
				};
				var options = {
						uri: base_url + "vehicleAllocationSearch",
						method: 'GET',
						jar: j,
						resolveWithFullResponse: true,
						simple: false,
						json: true,
						form: form
				};

				request(options)
						.then(res => {
								expect(res.statusCode).to.be(200);
								done();
						})
						.catch(err => done(err));
		});

		test("Test Post Vehicle Allocation RESTful API", function(done){
				var form = {
						"currVehicle": 'None'
				};

				var options = {
						uri: base_url + "vehicleAllocation",
						method: 'POST',
						jar: j,
						resolveWithFullResponse: true,
						simple: false,
						json: true,
						form: form
				};

				request(options)
						.then(res => {
								expect(res.statusCode).to.be(200);
								done();
						})
						.catch(err => done(err));
		});

		test("getAllVehicleAllocationInfo (models/vehicle.js)", function (done) {
        Vehicle.getAllVehicleAllocationInfo().then(infos => {
					// expect(infos[0].vehicleID).to.be("TestCar#0");
            expect(infos).to.exist;
            done();
        })
            .catch(err => done(err));
    });

		test("getVehicleAllocationInfoByOfficerName (models/vehicle.js)", function (done) {
        Vehicle.getVehicleAllocationInfoByOfficerName("TestOfficerJohn").then(infos => {
            expect(infos.length).to.be(2);
            done();
        })
            .catch(err => done(err));
    });

		test("getVehicleAllocationInfoByVehicleType (models/vehicle.js)", function (done) {
        Vehicle.getVehicleAllocationInfoByVehicleType(0).then(infos => {
            expect(infos).to.exist;
            done();
        })
            .catch(err => done(err));
    });

		test("deleteOfficer (models/vehicle.js)", function (done) {
        Vehicle.deleteOfficer("1").then(infos => {
            expect(infos).to.exist;
            done();
        })
            .catch(err => done(err));
    });

		test("addOfficerToVehicle (models/vehicle.js)", function (done) {
        Vehicle.addOfficerToVehicle("TestCar#0", "NewTestOfficer").then(infos => {
            expect(infos).to.exist;
            done();
        })
            .catch(err => done(err));
    });

		test("findAll (models/vehicle.js)", function (done) {
        Vehicle.findAll().then(infos => {
            expect(infos).to.exist;
            done();
        })
            .catch(err => done(err));
    });

});
