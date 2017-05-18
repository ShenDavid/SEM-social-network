process.env.NODE_ENV = 'test';

var expect = require('expect.js');
var request = require('request-promise');
var bluebird = require('bluebird');

var app = require("../app").app;
var pinDesc = require("../models/pinDesc");

var Db = require("../db/db");
var userLocation = require("../models/userLocationModel");
var utilityLocation = require("../models/utilityLocationModel")

var db = new Db();

var pin1 = new pinDesc("paul", "37.409714", "-122.061276", "test", true);

var userlocationModel = new userLocation();
var utilityLocationModel = new utilityLocation();

var userlocation_data = {
    username: "zening",
    latitude: "37.409714",
    longitude: "-122.061276",
    address : "hell"
};

var utilLoac_data = {
    utilityID: "34223241",
    latitude: "37.409714",
    longitude: "-122.061276",
    address: "hell",
    category: "incident"
};


suite("Map test", function(){
    this.timeout(2000);
    suiteSetup(function(done) {
        pin1.addPin()
            .then(() => {
            // userlocation.saveUserLocation()
        })
        .catch(error => {
            console.log(error);
    });
        db.start(function(connection) {
            utilityLocation.saveUtilityLocation(utilLoac_data, function (success) {
                expect(success).to.be(true);
                userLocation.saveUserLocation(userlocation_data, function (success2) {
                    expect(success2).to.be(true);
                    db.close(connection, function (ret) {
                        done();
                    })
                });

            })
        });

    });

    suiteTeardown(function(done) {
        db.start(function(connection){
            pin1.removePin().then()
                .catch(error => {
                console.log(error);
        });
            done();
        });
    });

    test("add pin success", function(done) {
        pinDesc.getPinByName("paul")
            .then(pinInfo => {
            console.log(pinInfo);
            expect(pinInfo[0].username).to.be("paul");
            expect(pinInfo[0].desc).to.be("test");
        done();
    })
        .catch(error => {
            console.log(error);
        });
    });

    test("add user location success", function(done) {
        // userLocation.getUserLocation("zening")
        //     .then(pinInfo => {
        //     console.log(pinInfo);
        userLocation.getUserLocation("zening", function (location) {
            expect(location[0].address).to.be("hell");
            expect(location[0].latitude).to.be("37.409714");
            expect(location[0].longitude).to.be("-122.061276");

            done();
        });
    });

    test("add util location success", function(done) {
        utilityLocation.getLocationByCategory("incident", function (location) {
            expect(location[0].address).to.be("hell");
            expect(location[0].latitude).to.be("37.409714");
            expect(location[0].longitude).to.be("-122.061276");

            done();
        });
    });

    test("add util location success", function(done) {
        utilityLocation.getUtilityLocation("34223241", function (location) {
            expect(location[0].address).to.be("hell");
            expect(location[0].latitude).to.be("37.409714");
            expect(location[0].longitude).to.be("-122.061276");
            done();
        });
    });


});
