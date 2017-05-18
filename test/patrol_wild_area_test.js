process.env.NODE_ENV = 'test';

var expect = require('expect.js');
var request = require('request-promise');
var bluebird = require('bluebird');

var app = require("../app").app;
var patrolArea = require("../models/patrolArea");

var Db = require("../db/db");
var wildfireArea = require("../models/wildfireArea");

var db = new Db();


var patrol_data = {
    creator: "zening",
    coordinates: [{lat : "37.409714", lng : "-122.061276"},{lat : "37.409724", lng : "-122.061376"},{lat : "37.409414", lng : "-122.061976"}],
    name : "test"
};

var wildfire_data = {
    creator: "zening",
    coordinates: [{lat : "37.409714", lng : "-122.061276"},{lat : "37.409724", lng : "-122.061376"},{lat : "37.409414", lng : "-122.061976"}],
    name : "test"
};


suite("Map test", function(){
    this.timeout(2000);
    suiteSetup(function(done) {
        db.start(function(connection) {
            patrolArea.addCoordinate(patrol_data, function (rs1) {
                expect(rs1).to.not.equal(null);
                wildfireArea.addCoordinate(wildfire_data, function (rs2) {
                    expect(rs1).to.not.equal(null);
                    db.close(connection, function (ret) {
                        done();
                    })
                });

            })
        });

    });

    suiteTeardown(function(done) {
        db.start(function(connection) {
            patrolArea.deleteByName(patrol_data, function (err1) {
                expect(err1).to.be(null);
                wildfireArea.deleteByName(wildfire_data, function (err2) {
                    expect(err2).to.be(null);
                    db.close(connection, function (ret) {
                        done();
                    })
                });

            })
        });
    });

    test("find added patrol area", function(done) {
        patrolArea.findByName(patrol_data, function (err1) {
            expect(err1).to.be(true);
            done();
        });
    });

    test("find added wildfire area", function(done) {
        wildfireArea.findByName(wildfire_data, function (err1) {
            expect(err1).to.be(true);
            done();
        });
    });

    test("find all patrol area", function(done) {
        patrolArea.getAllCoordinate(function (rs) {
            console.log("result");
            console.log(rs);
            expect(rs.length).to.be(1);
            done();
        });
    });
    test("find all wild fire area", function(done) {
        wildfireArea.getAllCoordinate(function (rs) {
            expect(rs.length).to.be(1);
            done();
        });
    });
});
