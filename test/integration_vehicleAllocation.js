// /**
//  * Created by Shicheng Xu on 17/3/17
//  */
// process.env.NODE_ENV = 'test';
//
// var expect = require('expect.js');
// var Group = require("../models/group");
//
// var newGroup1, newGroup2, newGroup3;
//
// var expect = require('expect.js');
// var request = require("request-promise");
// var bluebird = require('bluebird');
//
// var app = require("../app").app;
// var createNewUser = require("./integration_login").createNewUser;
// var login = require("./integration_login").login;
// var logout = require("./integration_login").logout;
// var base_url = "http://localhost:8080/";
//
// var j = request.jar();
//
// var Db = require("../db/db");
// var db = new Db();
// var mongoose = require('mongoose');
// var userDb = require('../db/interface/userDb');
// var user = require('../db/schema/user.js');
// var User = require("../models/user");
// var userModel = new User();
// var UserModel = mongoose.model('User', user.userSchema);
// var Organization = require("../models/organization");
// var organizationDb = require('../db/interface/organizationDb');
// var OrganizationModel = new Organization();
// var organizationDbInst = new organizationDb();
// var organization = require('../db/schema/organization.js');
// var OrganizationSchema = mongoose.model('Organization', organization.organizationSchema);
// var Vehicle = require("../models/vehicle");
// var vehicle = require('../db/schema/vehicle.js');
// var VehicleAllocationModel = mongoose.model('VehicleAllocation', vehicle.vehicleAllocationSchema);
//
// var newUser1, newUser2, newUser3, newUser4, newUser5;
// var conn;
//
// var org = new OrganizationSchema();
// var org2 = new OrganizationSchema();
// var loginUser = "TestUser2";
//
// suite("Fake Define Group Tests", function() {
//     suiteSetup(function (done) {
//       var vehicle1 = new VehicleAllocationModel();
//       vehicle1.vehicleID = "TestCar#0";
//       vehicle1.vehicleType = 0;
//       vehicle1.allocatedOfficers = ["TestOfficerJohn"];
//       var vehicle2 = new VehicleAllocationModel();
//       vehicle2.vehicleID = "TestTruck#0";
//       vehicle2.vehicleType = 1;
//       vehicle2.allocatedOfficers = ["TestOfficerJohn"];
//
//       vehicle1.save(function (err) {
//         vehicle2.save(function (err) {
//           // createNewUser(loginUser, "pass1", 0, 4).then(() => {
//           //     return login(loginUser, "pass1", j, false);
//           // })
//           // .then(() => done())
//           // .catch(err => done(err));
//         });
//       });
//       done();
//     });
//
//     suiteTeardown(function (done) {
//         VehicleAllocationModel.find({'vehicleID': 'TestCar#0'}).remove(function(err){
// 				VehicleAllocationModel.find({'vehicleID': 'TestTruck#0'}).remove(function(err){
//           //TODO:only remove the two users
//           UserModel.find({}).remove(function(err){
//             done();
//         		// logout(loginUser).then(() => done());
//         	});
//
// 				});
// 				});
//     });
//
//     test("Test getAllVehicleAllocationInfo RESTful API", function(done) {
// 				var options = {
// 						uri: base_url + "vehicleAllocation",
// 						method: 'GET',
// 						jar: j,
// 						resolveWithFullResponse: true
// 				};
//
// 				request(options)
// 						.then(res => {
// 								expect(res.statusCode).to.be(200);
// 								done();
// 						})
// 						.catch(err => done(err));
// 		});
//
//
// 		test("Test getMatchingVehicleAllocationInfo RESTful API", function(done){
// 				var form = {
// 						"officerName": "policeChief",
// 						"userType": 4
// 				};
// 				var options = {
// 						uri: base_url + "vehicleAllocationSearch",
// 						method: 'GET',
// 						jar: j,
// 						resolveWithFullResponse: true,
// 						simple: false,
// 						json: true,
// 						form: form
// 				};
//
// 				request(options)
// 						.then(res => {
// 								expect(res.statusCode).to.be(500);
// 								done();
// 						})
// 						.catch(err => done(err));
// 		});
//
// 		test("Test Post Vehicle Allocation RESTful API", function(done){
// 				var form = {
// 						"currVehicle": 'None'
// 				};
//
// 				var options = {
// 						uri: base_url + "vehicleAllocation",
// 						method: 'POST',
// 						jar: j,
// 						resolveWithFullResponse: true,
// 						simple: false,
// 						json: true,
// 						form: form
// 				};
//
// 				request(options)
// 						.then(res => {
// 								expect(res.statusCode).to.be(200);
// 								done();
// 						})
// 						.catch(err => done(err));
// 		});
//
// });
