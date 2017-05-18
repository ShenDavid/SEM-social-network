process.env.NODE_ENV = 'test';

var expect = require('expect.js');
var Db = require("../db/db");
var userlocation = require("../models/userLocationModel");
var utilitylocation = require("../models/utilityLocationModel");
var utilitylocationDb = require("../db/interface/UtilityLocationDb");
var userlocationDb = require("../db/interface/UserLocationDb");

var userlocationDbInst, utilitylocationDbInst;

var db = new Db();

var userlocation = {};
userlocation.username = "edian1";
userlocation.latitude = "carnegie mellon university";
userlocation.longitude = "37.410333";
userlocation.address = "122.410333";
var utilitylocation = {};
utilitylocation.utilityID = "u2";
utilitylocation.latitude = "37.410333";
utilitylocation.longitude = "122.410312";
utilitylocation.address = "test";
utilitylocation.category ="test";

var conn;


suite("accessMap", function() {
    suiteSetup(function (done) {

        userlocationDbInst = new userlocationDb();
        utilitylocationDbInst = new utilitylocationDb();

        db.start(function(connection){
            conn = connection;
            done();
        });
    });

    suiteTeardown(function (done) {

        db.close(conn, function (err) {
            done();
        });

    });

    test("Add user location success", function (done) {
        userlocationDbInst.addLocation(userlocation,function(err,rs){
            expect(rs.username).to.be("edian1");
            done();
        });
    });

    test("Add utility location success", function (done) {
        utilitylocationDbInst.addLocation(utilitylocation,function(err,rs){
            expect(rs.utilityID).to.be("u2");
            done();
        });
    });

});